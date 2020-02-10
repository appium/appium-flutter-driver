import org.gradle.jvm.tasks.Jar

group = "pro.truongsinh"
version = "0.0.4"

plugins {
    id("kotlinx-serialization") version "1.3.40"
    `build-scan`
    `maven-publish`
    kotlin("jvm") version "1.3.40" 
    id("org.jetbrains.dokka") version "0.9.17"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib")) 
    implementation ("org.jetbrains.kotlinx:kotlinx-serialization-runtime:0.14.0")
    implementation ("io.appium:java-client:2.1.0")
    testImplementation("junit:junit:4.12")
}

buildScan {
    termsOfServiceUrl = "https://gradle.com/terms-of-service" 
    termsOfServiceAgree = "yes"

    publishAlways() 
}

tasks.dokka {    
    outputFormat = "html"
    outputDirectory = "$buildDir/javadoc"
}

val dokkaJar by tasks.creating(Jar::class) { 
    group = JavaBasePlugin.DOCUMENTATION_GROUP
    description = "Assembles Kotlin docs with Dokka"
    classifier = "javadoc"
    from(tasks.dokka) 
}

publishing {
    publications {
        create<MavenPublication>("default") { 
            from(components["java"])
            artifact(dokkaJar) 
        }
    }
    repositories {
        maven {
            url = uri("$buildDir/repository") 
        }
    }
}
