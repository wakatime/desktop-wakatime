import { PropertiesManager } from "./properties-manager";

export abstract class FilterManager {
  static filterBrowsedSites(url: string) {
    const patterns = this.parseList(PropertiesManager.currentFilterList);
    if (patterns.length === 0) {
      return true;
    }

    // Create scheme-prefixed address versions to allow regular expressions
    // that incorporate a scheme to match
    const httpUrl = "http://" + url;
    const httpsUrl = "https://" + url;

    switch (PropertiesManager.filterType) {
      case "denylist": {
        for (const pattern of patterns) {
          if (
            url.match(pattern) ||
            httpUrl.match(pattern) ||
            httpsUrl.match(pattern)
          ) {
            // Address matches a pattern on the denylist. Filter the site out.
            return false;
          }
        }
        break;
      }
      case "allowlist": {
        const matchedPatternIndex = patterns.findIndex(
          (pattern) =>
            url.match(pattern) ||
            httpUrl.match(pattern) ||
            httpsUrl.match(pattern),
        );
        if (matchedPatternIndex === -1) {
          return false;
        }
        break;
      }
    }

    // The given address passed all filters and will be included
    return true;
  }

  private static parseList(list: string) {
    return list
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
