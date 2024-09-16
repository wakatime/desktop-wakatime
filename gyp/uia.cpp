// src/addon.cpp

#include <node_api.h>
#include <windows.h>
#include <ole2.h>
#include <UIAutomation.h>
#include <iostream>
#include <comutil.h>

IUIAutomation* pAutomation = NULL;

// Initialize COM and UI Automation
void InitializeUIAutomation() {
    HRESULT hr = CoInitialize(NULL);
    if (FAILED(hr)) {
        std::cerr << "Failed to initialize COM." << std::endl;
        return;
    }
    
    hr = CoCreateInstance(CLSID_CUIAutomation, NULL, CLSCTX_INPROC_SERVER, IID_IUIAutomation, (void**)&pAutomation);
    if (FAILED(hr)) {
        std::cerr << "Failed to create UIAutomation object." << std::endl;
        return;
    }
}

// Find the browser window (e.g., Google Chrome, Microsoft Edge) by its name
IUIAutomationElement* FindBrowserWindow(const wchar_t* browserName) {
    IUIAutomationCondition* pCondition = NULL;
    pAutomation->CreatePropertyCondition(UIA_NamePropertyId, _variant_t(browserName), &pCondition);

    IUIAutomationElement* pRootElement = NULL;
    pAutomation->GetRootElement(&pRootElement);

    IUIAutomationElement* pBrowserWindow = NULL;
    if (pRootElement) {
        pRootElement->FindFirst(TreeScope_Children, pCondition, &pBrowserWindow);
        pRootElement->Release();
    }

    pCondition->Release();
    return pBrowserWindow;
}

// Get the document element from the browser window
IUIAutomationElement* GetDocumentElement(IUIAutomationElement* pBrowserWindow) {
    IUIAutomationCondition* pCondition = NULL;
    pAutomation->CreatePropertyCondition(UIA_ControlTypePropertyId, _variant_t(UIA_DocumentControlTypeId), &pCondition);

    IUIAutomationElement* pDocumentElement = NULL;
    if (pBrowserWindow) {
        pBrowserWindow->FindFirst(TreeScope_Subtree, pCondition, &pDocumentElement);
    }

    pCondition->Release();
    return pDocumentElement;
}

// Retrieve text content from the document element (HTML content is inaccessible)
std::wstring GetDocumentText(IUIAutomationElement* pDocumentElement) {
    IUIAutomationTextPattern* pTextPattern = NULL;
    HRESULT hr = pDocumentElement->GetCurrentPatternAs(UIA_TextPatternId, IID_PPV_ARGS(&pTextPattern));

    if (SUCCEEDED(hr) && pTextPattern) {
        IUIAutomationTextRange* pTextRange = NULL;
        pTextPattern->get_DocumentRange(&pTextRange);

        BSTR bstrText;
        pTextRange->GetText(-1, &bstrText);

        std::wstring documentText(bstrText, SysStringLen(bstrText));

        SysFreeString(bstrText);
        pTextRange->Release();
        pTextPattern->Release();

        return documentText;
    }

    return L"";
}

// Function to be called from Node.js to get the active tab's document text
napi_value GetBrowserDocumentText(napi_env env, napi_callback_info info) {
    // Initialize UI Automation
    InitializeUIAutomation();

    const wchar_t* browserName = L"Google Chrome"; // Replace with other browser names as needed
    IUIAutomationElement* pBrowserWindow = FindBrowserWindow(browserName);

    napi_value result;
    if (pBrowserWindow) {
        IUIAutomationElement* pDocumentElement = GetDocumentElement(pBrowserWindow);
        if (pDocumentElement) {
            std::wstring documentText = GetDocumentText(pDocumentElement);

            // Convert std::wstring to napi_value
            napi_create_string_utf16(env, (const char16_t*)documentText.c_str(), NAPI_AUTO_LENGTH, &result);
        } else {
            napi_get_undefined(env, &result);
        }
    } else {
        napi_get_undefined(env, &result);
    }

    if (pAutomation) {
        pAutomation->Release();
    }
    CoUninitialize();

    return result;
}

// Initialization function for the addon
napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;
    napi_create_function(env, nullptr, 0, GetBrowserDocumentText, nullptr, &fn);
    napi_set_named_property(env, exports, "getDocumentText", fn);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)