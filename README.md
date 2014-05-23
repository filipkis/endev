Endev.js
========

Endev.js lets you work with data coming from popular web services by simply annotating HTML with queries. No need to write AJAX calls or deal with JavaScript callbacks. In fact, no need to write JavaScript at all. 

Usage
-----
1. Include the library

Download and include [endev.js](https://raw.githubusercontent.com/filipkis/endev/master/dist/endev.js) as well as AngularJS in your project and add it to your HTML file:

```
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
<script src="path_to_downloaded_file/endev.js"/>
```


2. Accessing the data

Endev uses [Yahoo! Query Language (YQL)](https://developer.yahoo.com/yql/) to access popular web services by using a simple query notation instead of dealing with the complex JavaScript AJAX calls.

To find out what data is available, how to compose the queries and what will the returned results look like, check out [YQL Console](https://developer.yahoo.com/yql/console).

The following example demonstrates how to get the images from Flickr:

```
<data from="flickr.photos.search fps" 
      where="fps.text = 'cats' AND 
                 fps.api_key = '8ed78f6ad69cdaf8412b4ea2d7dbbe47'">
    <div ng-repeat="p in fps.photo">
        <img ng-src="http://farm{{p.farm}}.staticflickr.com/{{p.server}}/{{p.id}}_{{p.secret}}.jpg">
    </div>
    <div ng-if="$pending">
        Loading...
    </div>
    <div ng-if="$error">
        Error occurred!
    </div>
</div>
```

##### Writing the query

To access the web service data, you should use __from__ and __where__ attributes in any HTML tag inside which you wish the data to be available. These two parameters specify which web service to use and what data to get.

* __from__ (required) is used to define the source of the data. The `flickr.photos.search` defines which web service, or more precisely data table from YQL is used (see [YQL Console](https://developer.yahoo.com/yql/console) for example of other data tables). The `fps` represents the label that you will use in the rest of the code to define the parameters or access results of your query. You can use any name for the label.
* __where__ (optional) is used to specify the parameters required by the web service. Most web services require some parameters to specify your query further (in this example that is the text parameter to search for photos of cats) and often other security parameters to identify the calls your application is making (in Flickr case that is the API key). Checking the documentation for the specific service or using [YQL Console](https://developer.yahoo.com/yql/console) should help in understanding what parameters are available and required.

##### Using the results

The `<div>` (or any other) tag with the `from` and `where` attributes will, on opening the HTML page, trigger the required code to access the YQL and get the requested data.   

To access the data you can use any [AngularJS](http://www.angularjs.org) directive or expression. In most common case, you will probably want to iterate over the results (as in the Flickr example). This can be achieved using an [ng-repeat](https://code.angularjs.org/1.2.16/docs/api/ng.directive:ngRepeat) directive. This directive iterates over all the objects in a collection and repeats the HTML attribute it is declared on for each iteration.

In the Flickr example we used `ng-repeat` with `p in fps.photo` expression. This expression defines that we want to iterate over `photo` records returned by the Flickr service (that was stored in `fps` label defined earlier) and for each iteration we will store the results in `p` object.

To get the actual image, we use the `ng-src` directive which allows us to define the source of the image by using the parameters of the results. Here we use AngularJS expression notation defined by double ``{{}}`` brackets.

##### Dealing with delays and errors

As it takes some time to access the web service and retrieve the data it is good practice to inform the user that loading of the data is in progress. Furthermore, there might be an error in getting the data. Endev provides two variables that help with of these states:

* __$pending__ will be true when the data is being loaded.
* __$error__ will be true when there was an error in loading the data.

To take the advantage of these variables we can use the [ng-if](https://code.angularjs.org/1.2.16/docs/api/ng.directive:ngIf) directive on HTML tags that will contain the information for each of the states. 

In the Flickr example, we have put the ``ng-if='$pending'`` on the div tag that will display _Loading..._ message only when the data is being loaded.


Built on top of AngularJS
---
Endev.js is built on top of [AngularJS](http://www.angularjs.org) and uses Angular's mechanism to provide data binding.



