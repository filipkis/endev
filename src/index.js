require("./angular/datatag/");
window.endev = {
    app: require("./angular/endev/")
};

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});
