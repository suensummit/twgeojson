var width, height, census, svg;
width = window.innerWidth * 0.8;
height = window.innerHeight - 10;
census = d3.map();
svg = d3.select('body').append('svg').attr('width', width).attr('height', height);
d3.json("tw.json", function(tw){
  return d3.csv("census2013-03.csv", function(it){
    return census.set(it.ivid, {
      household: it.household,
      male: it.male,
      female: it.female
    });
  }, function(){
    var val, max, _, c, quantize, proj, villages, path, g, partOf, wanted, zoomin, selected, zoomTo;
    val = function(it){
      return it.male + it.female;
    };
    max = d3.max((function(){
      var ref$, results$ = [];
      for (_ in ref$ = census) {
        c = ref$[_];
        results$.push(val(c));
      }
      return results$;
    }()));
    quantize = d3.scale.quantize().domain([0, max]).range(d3.range(9).map(function(i){
      return 'q' + i + '-9';
    }));
    proj = mtw();
    villages = topojson.feature(tw, tw.objects['villages']);
    path = d3.geo.path().projection(proj);
    g = svg.append('g').attr('class', 'villages');
    partOf = function(name){
      return function(it){
        return 0 === (it != null ? it.indexOf(name) : void 8);
      };
    };
    wanted = partOf('TPQ');
    zoomin = villages.features.filter(function(it){
      var ref$;
      return wanted((ref$ = it.properties) != null ? ref$.ivid : void 8);
    });
    g.selectAll('path').data(villages.features).enter().append('path').attr('class', function(it){
      if (!it.properties.ivid) {
        return;
      }
      return quantize(val(census.get(it.properties.ivid)));
    }).attr('d', path);
    selected = topojson.mesh(tw, tw.objects['villages'], function(a, b){
      var f, aa, g, bb;
      f = topojson.feature(tw, a);
      aa = wanted(f.properties.ivid);
      if (a === b && aa) {
        return true;
      }
      g = topojson.feature(tw, b);
      bb = wanted(g.properties.ivid);
      return a !== b && aa !== bb;
    });
    g.append('path').datum(selected).attr('class', 'selected').attr('d', path);
    zoomTo = function(set){
      var b, s, t, ref$, x, y;
      b = path.bounds(set);
      s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
      ref$ = b[0], x = ref$[0], y = ref$[1];
      return g.transition().duration(1000).attr("transform", "translate(" + 0 / 2 + "," + 0 / 2 + ")scale(" + s + ")translate(" + (-x) + "," + (-y) + ")").style("stroke-width", 5 / s + "px");
    };
    zoomTo({
      type: 'FeatureCollection',
      features: zoomin
    });
    d3.select('span.zoomout').on('click', function(){
      return zoomTo(villages);
    });
    return d3.select('span.zoomin').on('click', function(){
      return zoomTo({
        type: 'FeatureCollection',
        features: zoomin
      });
    });
  });
});