#!/usr/bin/env python

import io
import os

from setuptools import find_packages, setup

setup(
    name='Appium-Flutter-Finder',
    version='0.1.5',
    description='An extention of finder for Appium flutter',
    long_description=io.open(os.path.join(os.path.dirname('__file__'), 'README.md'), encoding='utf-8').read(),
    long_description_content_type='text/markdown',
    keywords=[
        'appium',
        'flutter',
        'python client',
        'mobile automation'
    ],
    author='Kazuaki Matsuo',
    author_email='fly.49.89.over@gmail.com',
    url='https://github.com/truongsinh/appium-flutter-driver',
    packages=find_packages(include=['appium_flutter_finder*']),
    license='MIT',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Environment :: Console',
        'Environment :: MacOS X',
        'Environment :: Win32 (MS Windows)',
        'Intended Audience :: Developers',
        'Intended Audience :: Other Audience',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Topic :: Software Development :: Quality Assurance',
        'Topic :: Software Development :: Testing'
    ],
    install_requires=['Appium-Python-Client >= 0.4']
)
