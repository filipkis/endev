describe('Testing data directive', function() {
  var $compile,
      $rootScope,$httpBackend, _$timeout_, geoPlacesHandler;

  // Load the myApp module, which contains the directive
  beforeEach(function(){
    module('Endev');
  });

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _$timeout_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;

    geoPlacesHandler = $httpBackend.when('GET', 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D\'Stockholm\'&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json').respond(200,{query: { results: "Geo result"}});
    restHandler = $httpBackend.when('GET', 'http://fake.rest.com?id=1&page=10').respond(200,{result: "Rest result"});

  }));

  it('Makes the call to YQL', function() {
    var element = $compile("<data from='geo.places gp' where='gp.text = \"Stockholm\"'>{{gp}}</data>")($rootScope);
    $rootScope.$digest();
    $httpBackend.expectGET('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D\'Stockholm\'&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json');
    $timeout.flush();
    $httpBackend.flush();

    expect(element.html()).toEqual("Geo result");
  });

  it('Makes the call to REST', function(){
    var element = $compile("<data from='http://fake.rest.com res' where='res.id = 1 AND res.page = 10'>{{res.result}}</data>")($rootScope);
    $rootScope.$digest();
    $httpBackend.expectGET('http://fake.rest.com?id=1&page=10');
    $timeout.flush();
    $httpBackend.flush();
 
    expect(element.html()).toEqual("Rest result");
  });

  it("Should work with multiline string",function(){
    var element = $compile("<div from='http://fake.rest.com res' where='res.id = 1 AND res.page = 10' provider='yql'>{{res.result}}</div>")($rootScope);
  })


  // it('Makes the call to Firebase',function(){
  //   var element = $compile("<data provider='firebase' from='test res'>{{res.result}}</data>")($rootScope);
  //   $rootScope.$digest();
  //   $timeout.flush();
  //   setTimeout(function(){
  //     expect(angular.element(element).scope().res).toBeDefined()
  //   },1500)
  // })
});