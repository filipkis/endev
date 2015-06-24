module.exports = function() {
  return function Expr(expr,label) {
    this.expression = expr;
    this.lhs = expr.split(COMPARISON_REGEX)[0].trim();
    this.rhs = expr.split(COMPARISON_REGEX)[1].trim();
    this.operator = COMPARISON_REGEX.exec(expr);
    this.attribute = this.lhs.replace(new RegExp("^" + label + ".", "g"),"");
    this.setValue = function(value) {
      this.value = value;
      this.obj = _.reduceRight(this.attribute.split("."),function(memo,id){ var result = {}; result[id] = memo; return result}, value);
      return value;
    }
    this.replace = function(value) {
      return (this.attribute || this.lhs) + this.operator + value;
    }
  }
}
