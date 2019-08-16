plugins {
    `build-scan` 
    kotlin("jvm") version "1.2.71" 
}

repositories {
    jcenter() 
}

dependencies {
    implementation(kotlin("stdlib")) 
}

buildScan {
    termsOfServiceUrl = "https://gradle.com/terms-of-service" 
    termsOfServiceAgree = "yes"

    publishAlways() 
}
