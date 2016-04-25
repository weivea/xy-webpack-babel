let React = window.React;

class App extends React.Component {
  constructor(props,context){
    super(props,context);
    this.state = {
      a:12
    };
  }

  componentWillMount() {
    var aa = new Promise(function (resole, reject) {
     
        setTimeout(function () {
          resole((new Date()).getTime());
        },1000)
     
    });
    
    aa.then(function (re) {
      console.log(re);
    })
    
    
    var b=[1,2,3];
    
    var c = [4,5,...b];
    
    function afun() {
      console.log(arguments);
    }
    afun(...c);
    console.log(c);

  }
  render() {
    return (
      <div>
        <h1>xy-webpack-babel</h1>
        <pre><code>
          {JSON.stringify(this.state, null, 2)}
        </code></pre>
      </div>
    );
  }
}

export default App;
