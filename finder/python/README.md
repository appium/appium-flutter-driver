# Getting the Appium Flutter Finder

There are three ways to install and use the Appium Flutter Finder.
Supported Python version follows appium python client.

1. Install from [PyPi](https://pypi.org), as ['Appium-Flutter-Finder'](https://pypi.org/project/Appium-Flutter-Finder/).

    ```shell
    pip install Appium-Flutter-Finder
    ```

2. Install from source, via [PyPi](https://pypi.org). From ['Appium-Flutter-Finder'](https://pypi.org/project/Appium-Flutter-Finder/),
download and unarchive the source tarball (`appium_flutter_finder-X.X.tar.gz`).

    ```shell
    tar -xvf appium_flutter_finder-X.X.tar.gz
    cd appium_flutter_finder-X.X
    python -m pip install .
    ```

3. Install from source via [GitHub](https://github.com/appium/appium-flutter-driver).

    ```shell
    git clone git@github.com:appium/appium-flutter-driver.git
    cd appium-flutter-driver/finder/python
    python -m pip install .
    ```

# How to use
Examples can be found out [here](../../example/python/example.py).

# Release

```shell
python -m pip install --upgrade build twine
python -m build
python -m twine check dist/*
python -m twine upload dist/appium_flutter_finder-*
```

# Changelog
- 0.8.2
    - Migrate package metadata and builds to `pyproject.toml`
- 0.8.1
    - Relax the Appium-Python-Client upper version to accept v6
- 0.8.0
    - Update the limit of python appium client version
- 0.7.0
    - Update the limit of python appium client version
- 0.6.1
    - Fix package
- 0.6.0
    - Fix type of `match_root` and `first_match_only` in `by_ancestor` and `by_descendant
- 0.5.0
    - Allow Appium-Python-Client to be v3
- 0.4.0
    - Bump base Appium-Python-Client to v2
- 0.3.1
    - Use Appium-Python-Client 1.x
- 0.3.0
    - Add `first_match_only` option in `by_ancestor` and `by_descendant`
- 0.2.0
    - Support over Python 3.6
- 0.1.5
    - Fix `by_ancestor` and `by_descendant`
        - https://github.com/truongsinh/appium-flutter-driver/pull/165#issuecomment-877928553
- 0.1.4
    - Remove whitespaces from the decoded JSON
    - Fix `by_ancestor` and `by_descendant`
- 0.1.3
    - Allow `from appium_flutter_finder import FlutterElement, FlutterFinder`
- 0.1.2
    - Fix b64encode error in Python 3
- 0.1.1
    - Initial release
