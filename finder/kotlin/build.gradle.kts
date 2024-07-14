import org.gradle.jvm.tasks.Jar

group = "pro.truongsinh"
version = "0.0.6"

plugins {
    id("kotlinx-serialization") version "1.3.40"
    `maven-publish`
    kotlin("jvm") version "1.3.40" 
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib")) 
    implementation ("org.jetbrains.kotlinx:kotlinx-serialization-runtime:0.14.0")
    implementation ("io.appium:java-client:8.0.0")
    implementation("org.seleniumhq.selenium:selenium-support:4.1.1")
    testImplementation("junit:junit:4.12")
}

publishing {
    publications {
        create<MavenPublication>("default") { 
            from(components["java"])
        }
    }
    repositories {
        maven {
            url = uri("$buildDir/repository") 
        }
    }
}
