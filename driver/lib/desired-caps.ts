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
  platformName: {
    inclusionCaseInsensitive: [
      `iOS`,
      `Android`,
    ],
    isString: true,
    presence: true,
  },
  udid: {
    isString: true,
  },
  retryBackoffTime: {
    isNumber: true,
  },
  maxRetryCount: {
    isNumber: true,
  },
};
