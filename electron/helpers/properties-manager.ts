import { getDesktopWakaTimeConfigFilePath } from "../utils";
import { DomainPreferenceType, FilterType } from "../utils/constants";
import { Logging } from "../utils/logging";
import { ConfigFileReader } from "./config-file-reader";

enum Keys {
  shouldLaunchOnLogin = "launch_on_login",
  shouldLogToFile = "log_to_file",
  shouldRequestA11y = "request_a11y",
  shouldAutomaticallyDownloadUpdates = "should_automatically_download_updates",
  hasLaunchedBefore = "has_launched_before",
  domainPreference = "domain_preference",
  filterType = "filter_type",
  denylist = "denylist",
  allowlist = "allowlist",
  autoUpdateEnabled = "auto_update_enabled",
}

export class PropertiesManager {
  static get autoUpdateEnabled(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.autoUpdateEnabled,
    );
    if (value === null) {
      ConfigFileReader.setBool(
        file,
        "properties",
        Keys.autoUpdateEnabled,
        true,
      );
      return true;
    }
    return value;
  }
  static set autoUpdateEnabled(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.autoUpdateEnabled,
      value,
    );
  }

  static get shouldLaunchOnLogin(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.shouldLaunchOnLogin,
    );
    if (value === null) {
      ConfigFileReader.setBool(
        file,
        "properties",
        Keys.shouldLaunchOnLogin,
        true,
      );
      return true;
    }
    return value;
  }
  static set shouldLaunchOnLogin(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.shouldLaunchOnLogin,
      value,
    );
  }

  static get shouldLogToFile(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.shouldLogToFile,
    );
    if (value === null) {
      ConfigFileReader.setBool(file, "properties", Keys.shouldLogToFile, false);
      return false;
    }
    return value;
  }
  static set shouldLogToFile(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.shouldLogToFile,
      value,
    );
    if (value) {
      Logging.instance().activateLoggingToFile();
    } else {
      Logging.instance().deactivateLoggingToFile();
    }
  }

  static get shouldAutomaticallyDownloadUpdates(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.shouldAutomaticallyDownloadUpdates,
    );
    if (value === null) {
      ConfigFileReader.setBool(
        file,
        "properties",
        Keys.shouldAutomaticallyDownloadUpdates,
        true,
      );
      return true;
    }
    return value;
  }
  static set shouldAutomaticallyDownloadUpdates(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.shouldAutomaticallyDownloadUpdates,
      value,
    );
  }

  static get shouldRequestA11yPermission(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.shouldRequestA11y,
    );
    if (value === null) {
      ConfigFileReader.setBool(
        file,
        "properties",
        Keys.shouldRequestA11y,
        true,
      );
      return true;
    }
    return value;
  }
  static set shouldRequestA11y(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.shouldRequestA11y,
      value,
    );
  }

  static get hasLaunchedBefore(): boolean {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.getBool(
      file,
      "properties",
      Keys.hasLaunchedBefore,
    );
    if (value === null) {
      return false;
    }
    return value;
  }
  static set hasLaunchedBefore(value: boolean) {
    ConfigFileReader.setBool(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.hasLaunchedBefore,
      value,
    );
  }

  static get domainPreference(): DomainPreferenceType {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.get(
      file,
      "properties",
      Keys.domainPreference,
    );
    if (value === null) {
      return DomainPreferenceType.domain;
    }
    return value === DomainPreferenceType.domain
      ? DomainPreferenceType.domain
      : value === DomainPreferenceType.url
        ? DomainPreferenceType.url
        : DomainPreferenceType.domain;
  }
  static set domainPreference(value: DomainPreferenceType) {
    ConfigFileReader.set(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.domainPreference,
      value,
    );
  }

  static get filterType(): FilterType {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.get(file, "properties", Keys.filterType);
    if (value === null) {
      return FilterType.allowlist;
    }
    return value === FilterType.allowlist
      ? FilterType.allowlist
      : value === FilterType.denylist
        ? FilterType.denylist
        : FilterType.denylist;
  }
  static set filterType(value: FilterType) {
    ConfigFileReader.set(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.filterType,
      value,
    );
  }

  static get denylist(): string {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.get(file, "properties", Keys.denylist);
    if (value === null) {
      return "";
    }
    return value;
  }
  static set denylist(value: string) {
    ConfigFileReader.set(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.denylist,
      value,
    );
  }

  static get allowlist(): string {
    const file = getDesktopWakaTimeConfigFilePath();
    const value = ConfigFileReader.get(file, "properties", Keys.allowlist);
    if (value === null) {
      return (
        "https?://(\\w\\.)*github\\.com/\n" +
        "https?://(\\w\\.)*gitlab\\.com/\n" +
        "^stackoverflow\\.com/\n" +
        "^docs\\.python\\.org/\n" +
        "https?://(\\w\\.)*golang\\.org/\n" +
        "https?://(\\w\\.)*go\\.dev/\n" +
        "https?://(\\w\\.)*npmjs\\.com/\n" +
        "https?//localhost[:\\d+]?/"
      );
    }
    return value;
  }
  static set allowlist(value: string) {
    ConfigFileReader.set(
      getDesktopWakaTimeConfigFilePath(),
      "properties",
      Keys.allowlist,
      value,
    );
  }

  static get currentFilterList() {
    switch (this.filterType) {
      case FilterType.allowlist:
        return this.allowlist;
      case FilterType.denylist:
        return this.denylist;
    }
  }
}
