# Cloud Android RPA Example

This directory contains example configurations for running Appium tests
on cloud Android devices (e.g. QtPhone, AWS Device Farm, BrowserStack).

## Quick Start

```python
from appium import webdriver

desired_caps = {
    "platformName": "Android",
    "deviceName": "cloud-android",
    "app": "/path/to/app.apk",
    "qtphone:host": "your-cloud-device-host",
    "qtphone:port": 5555,
}

driver = webdriver.Remote("http://your-cloud-endpoint/wd/hub", desired_caps)
driver.find_element_by_id("com.example:id/btn").click()
```

## Cloud Device Considerations

- Use `adb connect` to establish connection to cloud devices
- Set `newCommandTimeout` higher for cloud devices (recommended: 300s)
- Implement device health-check heartbeat for long-running test sessions

## References

- [QtPhone Cloud Android](https://www.qtphone.com/)
- [Appium](https://github.com/appium/appium)
