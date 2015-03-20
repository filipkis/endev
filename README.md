EndevJS
========

EndevJS lets you work with data coming from popular web services by simply annotating HTML with data queries. No need to write AJAX calls or deal with JavaScript callbacks. In fact, no need to write JavaScript at all. 

## Usage

### Include the library

You need to include the stand alone [endev.full.js](http://www.endevjs.org/endev.full.js) in your HTML which includes also all the needed dependencies (Angular, Firebase, etc.):

```html
<script src="http://www.endevjs.org/endev.full.js"/>
```

Alternatively, you use the stripped down [endev.js](http://www.endevjs.org/endev.js) and include the needed libraries yourself:


```html

<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.2/underscore.js"></script>
<!-- Including Firebase and AngularFire is optional and needed only if you are going to use Firebase data  -->
<script src="https://cdn.firebase.com/js/client/2.2.3/firebase.js"></script>
<script src="https://cdn.firebase.com/libs/angularfire/1.0.0/angularfire.min.js"></script>
<script src="http://www.endevjs.org/endev.js"/>
```


### Accessing the data

EndevJS is designed to be modular and work with various data sources. Writing data queries should be independent of the source or the format of the data. This goal is similar to the goal of [Yahoo! Query Language (YQL)](https://developer.yahoo.com/yql/). The difference is that YQL provides you the query language and a back-end to request and processes the data, while EndevJS allows you to use the data in your HTML without writing JavaScript. In a way the two complement each other and therefor EndevJS was designed to work well with YQL.

The modularity of EndevJS is achieved through having providers (you can think of them like database drivers) for different data source technologies. Currently there are 3 providers given with EndevJS: `YQL`, `REST` and `Firebase`. `YQL` and `REST` currently work in read-only mode  and they are ideal for accessing data from various APIs. `Firebase`, on the other hand, gives you a possibility to build your own data structure to store and sync your data. In many applications you need a combination of both and this is where EndevJS is ideal. The detailed description of each provider is given bellow.

#### YQL

`yql` provider allows you to access any of the numerous data tables both to access Yahoo APIs (search, weather, flicker, etc.) or community contributed tables for third party APIs (google, facebook, twitter, etc.). There are even data tables that can be used to access generic data coming in various formats (JSON, XML, RSS, CSV, etc.). Finally you can [provide your own data table](https://developer.yahoo.com/yql/guide/yql_dev_guide.html) with possibility to do some back-end processing of either request (e.g. adding authentication info) or response (filtering and reformatting the data). 

To find out what data is available, how to compose the queries and what will the returned results look like, check out [YQL Console](https://developer.yahoo.com/yql/console).

##### Usage

To access photos of cats from Flickr API in YQL you would write the following query:

```sql
SELECT * FROM flickr.photos.search WHERE text = 'cats' AND api_key = '8ed78f6ad69cdaf8412b4ea2d7dbbe47'
```

which would give you the following JSON result:

```json
{
 "query": {
  "count": 10,
  ...
  "results": {
   "photo": [
    {
     "farm": "4",
     "id": "15642379052",
     "isfamily": "0",
     "isfriend": "0",
     "ispublic": "1",
     "owner": "65988573@N00",
     "secret": "c9985fac41",
     "server": "3952",
     "title": "IMG_20140831_135854"
    },
    ...
   ]
  }
 }
}
```

Now let's use the same YQL query in EndevJS query annotated HTML to actually show the pictures:

```html
<div data-provider="yql" data-from="flickr.photos.search fps" 
      data-where="fps.text = 'cats' AND 
                 fps.api_key = '8ed78f6ad69cdaf8412b4ea2d7dbbe47'">
    <div data-from="fps.photo p">
        <img ng-src="http://farm{{p.farm}}.staticflickr.com/{{p.server}}/{{p.id}}_{{p.secret}}.jpg">
    </div>
</div>
```

* `data-provider` defines that we are using YQL. The data-provider attribute is only needed on the annotation where you access the YQL table (e.g. flickr.photos.search). When you access the child data of a specific result (e.g. `fps.photo` where fps refers to the previously accessed table) you should not define the provider.
* `data-from` specifies the YQL data table (e.g. flickr.photos.search) including your own `label` (e.g. fps) that is required by EndevJS
* `data-where` can be used in same manner as WHERE statement of YQL with the difference that in EndevJS you need to prepend the label to your where parameters (e.g. instead of just `text = 'cats'` you write `fps.text = 'cats'`)
* `data-use` attribute is needed when you want to use your own custom data tables. In this attribute you specify the URL (publicly available as YQL needs to access it) to your data table XML definition. See [data table examples](examples/data-tables) and [YQL documentation](https://developer.yahoo.com/yql/guide/yql_dev_guide.html) for more info.

#### Firebase

[Firebase](https://www.firebase.com/) provides a cloud service for storing and syncing your own data. The data is stored as JSON-like objects (i.e. similar to typical NoSQL) and is automatically synced, or in other words, you can receive events in your app whenever data changes. As it is not relational database, your objects do not have a predefined structure and you can modify them as you wish when you wish. Ideal for prototyping or applications where data structures often change. 

EndevJS `firebase` provider allows you to use most of the features of Firebase including inserting and removing the data and keeping the data in your HTML code automatically in sync with any changes.

##### Usage

To demo the usage of the `firebase` provider we will use the [Queue system](examples/qwait.html) example where we want to create an app for managing people waiting in the queues (typically used in programming lab sessions where students register in queues to receive assistance).

Our system will need a main object (called Queues) where we will store different existing queues (e.g. for different courses). Each queue will have a `name` and a collection of `positions` where each position identifies a person in the queue and has `username` (e.g. jsmith), `name` (e.g. John Smith), `location` (e.g. lab room 1, lab room 2, etc.). Here is the example of the data:

```json
{Queues: [{
    name: 'endev course',
    positions: [{
        username: 'jsmith',
        name: 'John Smith',
        location: 'comp 5, room 1'
        },{
        username: 'bmark',
        name: 'Bob Mark',
        location: 'comp 2, room 1'
        }]
    }]
}
```

Let's now query annotate the HTML to create and use such data:

```html
<div data-from="Queues queue" where="queue.name = 'endev course'" data-provider='firebase'>
    Queue: {{queue.name}}
  <div data-from="queue.positions myPosition" data-where="myPosition.username = 'jsmith'" default="{username:'jsmith',name:'John Smith'}" auto-update="true">
    <input data-value="myPosition.name"/>
    <input data-value="myPosition.location"/>
    <div data-new>
      <button data-new insert-into="queue.positions" data-click="insert(myPosition)">Add</button>
    </div>
    <div data-edit>
      <button remove-from="queue.positions" data-click="remove(myPosition)">Remove</button>
    </div>
  </div>
    <div data-from="queue.positions position">
        {{position.name}}
    </div>
</div>
```

* `data-provider` defines that we are using Firebase. The data-provider attribute is only needed on the annotation where your access to Firebase starts from the root object (e.g. Queues). When you access the child data of a specific result (e.g. `queue.positions` where `queue` refers to the previously accessed table) you should not define the provider.
* `data-from` specifies the object path (e.g. queue.positions) including your own `label` (e.g. myPosition) that is required by EndevJS
* `data-where` specifies the condition for the object. It will return only the objects that specify the conditions
* `default` ... 
* `auto-update` ...

*Note:* At the moment any data you create using `firebase` provider will be created in the Endev's Firebase account. As this feature is highly under development this is for the purpose of easier debugging. This will be changed in a near future allowing you to use your own Firebase accounts.

#### REST

If the API you need is not available in the YQL - fear not. You can still use Endev to access (almost) any API that returns JSON as a result. The only requirement is that the API has Access-Control-Allow-Origin turned on. 

To use any API, just replace the YQL source data with the address you want to access. For instance:

```html
<div from="http://www.example.com/data.json data" where="data.q = query">
</div>
```

Additionally, if you need to set specific HTTP headers (for instance Authorization), you can do that by specifying headers tag and giving it a JSON object.

```html
<data from="http://www.example.com/data.json data" where="data.q = query" headers="{Authorization: 'Access token example'}">
</data>
```

<!--## Query annotations

### Accessing the data: `data-from`

To access the web service data, you should use __from__ and __where__ attributes in any HTML tag inside which you wish the data to be available. These two parameters specify which web service to use and what data to get.

* __from__ (required) is used to define the source of the data. You define it as `path.to.source label`. The `path.to.source` parameter is specific to provider use (see providers bellow) while the `label` defines the variable in which you can use to filter the results in the `where` attribute or to access the results in the rest of your code. You can use any valid (alphanumeric only)name for the label.
* __provider__ (required) defines where the data comes from. The currently available providers that ship with Endev are: `yql`, `rest` and `firebase`. More details on these can be found in the providers section bellow.
* __where__ (optional) is used to specify the parameters required by the web service or to filter your data results. Most web services require some parameters to specify your query further (in the above example that is the text parameter to search for photos of cats) and often other security parameters to identify the calls your application is making (in Flickr case that is the API key). Checking the documentation for the specific service or using [YQL Console](https://developer.yahoo.com/yql/console) should help in understanding what parameters are available and required.
* __auto-update__ (optional and available only with `firebase` provider) defines that as soon as you update your data in the view (e.g. through data-view attribute in an input tag, or using the data-click actions) the data will be updated in the data source as well.
* __refresh__ (optional) specifies the milliseconds in which the request should be repeated. Use this attribute with caution as some APIs have limited number of request in some time interval, so you might reach that limit if you put a low value.  
* __log__ (optional) if set to true will log the data returned by the service in the console. This helps when debugging and trying to understand how the returned data is organized.

### Reading the results: `{{}}` or `data-value`

The `<div>` (or any other) tag with the `from` and `where` attributes will, on opening the HTML page, trigger the required code to access the YQL and get the requested data.   

To access the data you can use any [AngularJS](http://www.angularjs.org) directive or expression. In most common case, you will probably want to iterate over the results (as in the Flickr example). This can be achieved using an [ng-repeat](https://code.angularjs.org/1.2.16/docs/api/ng.directive:ngRepeat) directive. This directive iterates over all the objects in a collection and repeats the HTML attribute it is declared on for each iteration.

In the Flickr example we used `ng-repeat` with `p in fps.photo` expression. This expression defines that we want to iterate over `photo` records returned by the Flickr service (that was stored in `fps` label defined earlier) and for each iteration we will store the results in `p` object.

To get the actual image, we use the `ng-src` directive which allows us to define the source of the image by using the parameters of the results. Here we use AngularJS expression notation defined by double ``{{}}`` brackets.

 ##### Dealing with delays and errors

As it takes some time to access the web service and retrieve the data it is good practice to inform the user that loading of the data is in progress. Furthermore, there might be an error in getting the data. Endev provides two variables that help with of these states:

* __$pending__ will be true when the data is being loaded.
* __$error__ will be true when there was an error in loading the data.

To take the advantage of these variables we can use the [ng-if](https://code.angularjs.org/1.2.16/docs/api/ng.directive:ngIf) directive on HTML tags that will contain the information for each of the states. 

In the Flickr example, we have put the ``ng-if='$pending'`` on the div tag that will display _Loading..._ message only when the data is being loaded. -->


Built on top of AngularJS
---
Endev.js is built on top of [AngularJS](http://www.angularjs.org) and uses Angular's mechanism to provide data binding.



