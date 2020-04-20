
[![Build Status](https://travis-ci.org/msio/ionic-unit-testing-example.svg?branch=master)](https://travis-ci.org/msio777/ionic-unit-testing-example)

# Fitness Ionic2 Meteor App

Fitness App is dedicated to people who are looking for motivation to train in the gym or support by similar workouts. It also important to find somebody who is free on the same time and wants to train in the same gym. Fitness App helps match those people together. 

## Table of Contents ##

* [Motivation](#motivation)
* [Screenshots](#screenshots)
    * [Android](#android)
    * [IOS](#ios)
* [Prerequisites](#prerequisites)
* [Install and Start](#install-and-start)
    * [Api](#api)
    * [Client](#client)

## Motivation

Lots of people want to train in the gym but they are not enough motivated to really go there by themselves or there are already fitness enthusiasts who want to get better and need support by working out. The most challenge for everybody is to find somebody who wants to train on the same time, in the same gym and has similar workouts. 

## Screenshots

### Android

<span><img src="https://github.com/msio/Fitness-Ionic2-Meteor/blob/master/screens/screen1.png" width="300">
<img src="https://github.com/msio/Fitness-Ionic2/blob/master/screens/screen2.png" width="300"></span>

### IOS

<span><img src="https://github.com/msio/Fitness-Ionic2/blob/master/screens/screen3.png" width="300">
<img src="https://github.com/msio/Fitness-Ionic2/blob/master/screens/screen4.png" width="300">
<img src="https://github.com/msio/Fitness-Ionic2/blob/master/screens/screen5.png" width="300"></span>

## Prerequisites

 * Node 6.9.0 or higher 
 * NPM 3 or higher
 * [mongodb](https://www.mongodb.com/download-center?_ga=2.88441819.1504749810.1504631865-250124745.1504631865#community)
 * [meteor](https://www.meteor.com/install)
 * [ionic](http://ionicframework.com/docs/intro/installation/) 

## Install and Start     
 
 ### Api
 
  * from root folder `cd api`
  * `npm install`
  * `chmod 777 run.sh`
  * `npm start` (run.sh script is tested on osx)
  *  to use [Cloudinary](http://cloudinary.com/), [Faceabook](https://developers.facebook.com/), [One Signal](https://documentation.onesignal.com/docs) - rename `private/development.settings.json.example` to `private/development.settings.json` and set values  
     
 ### Client
 
 * from root folder `cd client`      
 * `npm run install-all` (installs npm and meteor api dependencies for client (look into meteor-client.config.json) also [here](https://github.com/Urigo/meteor-client-bundler) )
 * `npm start` (runs in browser)
 * log in with email: john@test.com, password: test1234
 
