# AppiumFlutterFinder

Kotlin finder elements for https://github.com/appium/appium-flutter-driver

## Installation

This is available via Jitpack, or the local dependencies.

https://jitpack.io/#appium/appium-flutter-driver

An example of snapshot of the `main`.

- `settings.gradle`
```groovy
	dependencyResolutionManagement {
		repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
		repositories {
			mavenCentral()
			maven { url 'https://jitpack.io' }
		}
	}
```

- gradle file
```groovy
	dependencies {
	    testImplementation 'com.github.appium:appium-flutter-driver:main-SNAPSHOT'
	}
```

```groovy
	dependencies {
	    testImplementation 'com.github.appium:appium-flutter-driver:kotlin-finder-0.0.7'
	}
```


Please check https://docs.jitpack.io/ for more details about the jitpack usage.

## Package name

`pro.truongsinh.appium_flutter` is this project's package name space.

## Changlogs

- 0.0.7
    - Available via jitpack

# Other Java implementations

- https://github.com/ashwithpoojary98/javaflutterfinder
- https://github.com/5v1988/appium-flutter-client
