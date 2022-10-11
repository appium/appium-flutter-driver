export interface IDesiredCapConstraints {
  deviceName?: string;
  platformName: {
    presence: boolean;
    isString: boolean;
    inclusionCaseInsensitive: string[];
  };
  automationName: {
    presence: boolean;
    isString: boolean;
    inclusionCaseInsensitive: string[];
  };
  app: any;
  avd: any;
  udid: any;
  retryBackoffTime: any;
  maxRetryCount: any;
  observatoryWsUri: {
    isString: boolean;
  };
  skipPortForward: {
    isBoolean: boolean;
  };
}

export const desiredCapConstraints: IDesiredCapConstraints = {
  app: {
    isString: true,
  },
  automationName: {
    inclusionCaseInsensitive: [`Flutter`],
    isString: true,
    presence: true,
  },
  avd: {
    isString: true,
  },
  maxRetryCount: {
    isNumber: true,
  },
  platformName: {
    inclusionCaseInsensitive: [
      `iOS`,
      `Android`,
    ],
    isString: true,
    presence: true,
  },
  retryBackoffTime: {
    isNumber: true,
  },
  udid: {
    isString: true,
  },
  observatoryWsUri: {
    isString: true,
  },
  skipPortForward: {
    isBoolean: true
  }
};
