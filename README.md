EndevJS
========

EndevJS lets you work with data coming from popular web services by simply annotating HTML with data queries. No need to write AJAX calls or deal with JavaScript callbacks. In fact, no need to write JavaScript at all. 

## Setup

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

If you prefer using [Bower](http://bower.io/) you can install it as:

```bash
$ bower install endev --save
```

## How to use

Here is a simple example of a ToDo list app. You can also check it out running and fork it from [CodePen](http://codepen.io/filipkis/pen/BjdXVG):

```html
<h4>Create a new task</h4>
<input data-value="newTask"/>
<button insert-into="firebase:TodoList" data-click="insert({name:newTask,done:false})">Add task</button>
<h4>My tasks</h4>
<div from="firebase:TodoList item" where="item.done = false" auto-update="true">
  <input type="checkbox" data-value="item.done"/> <input data-value="item.name"/>
  <button data-click="update(item)"></button>
</div>
```

Check out the [tutorial](http://www.endevjs.org/tutorial/) to learn how to use Endev to access various data sources and build protoypes quickly.

### Supported data providers

The following providers are supported out of the box with Endev:

* `local:` uses browser's local storage.
* `firebase:` uses [Firebase](https://www.firebase.com). Check bellow on how to configure.
* `yql:` (read-only) uses [YQL](https://developer.yahoo.com/yql/) to uniformly (one syntax) access more than thousand APIs (check community table in [YQL Console](https://developer.yahoo.com/yql/console/)) including popluar ones like twitter, Facebook, Google, etc. The generic data tables (json, xml, html, etc.) also allow you to read any data coming in that format.
* `http:` or `https:` (read-only) can be used to read any REST API that returns JSON or XML and supports [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing). In case the API you want to use doesn't support CORS, you can use yql as shown in this [CodePen](http://codepen.io/filipkis/pen/obwWYm) example from the [tutorial](http://www.endevjs.org/tutorial/).

#### Firebase settings

If you're using Firebase as the data provider Endev will, by default, access the it's own storage where data for many examples is stored. If you're just testing out that is fine, but if you use common name for your collection (e.g. ToDo, Books, etc.) chances are that the name is already used by other apps so you might get your data mixed up.

To setup your own storage, create an account at [Firebase](https://www.firebase.com) and add following code to your HTML:

```html
<script>
endev.firebaseProvider = {
    path: 'https://YOUR_FIREBASE_STORAGE_NAME.firebaseio.com'
}
</script>
```

Built on top of AngularJS
---
Endev.js is built on top of [AngularJS](http://www.angularjs.org) and uses Angular's mechanism to provide data binding.


