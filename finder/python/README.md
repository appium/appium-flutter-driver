# Getting the Appium Flutter Finder

There are three ways to install and use the Appium Flutter Finder.
Supported Python version follows appium python client.

1. Install from [PyPi](https://pypi.org), as ['Appium-Flutter-Finder'](https://pypi.org/project/Appium-Flutter-Finder/).

    ```shell
    pip install Appium-Flutter-Finder
    ```

2. Install from source, via [PyPi](https://pypi.org). From ['Appium-Flutter-Finder'](https://pypi.org/project/Appium-Flutter-Finder/),
download and unarchive the source tarball (Appium-Flutter-Finder-X.X.tar.gz).

    ```shell
    tar -xvf Appium-Flutter-Finder-X.X.tar.gz
    cd Appium-Flutter-Finder-X.X
    python setup.py install
    ```

3. Install from source via [GitHub](https://github.com/appium/python-client).

    ```shell
    git clone git@github.com:appium/python-client.git
    cd python-client
    python setup.py install
    ```

# How to use
Examples can be found out [here](../../example/python/example.py).

# Release

```
pip install twine
```

```
python setup.py sdist
twine upload dist/Appium-Flutter-Finder-X.X.tar.gz
```

# Changelog
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
