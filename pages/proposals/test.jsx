import React from 'react';
import Header from '../../components/header.jsx';
import generateHelmet from '../../lib/helmet.jsx';



class TestPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.pageClassName = ``;
    this.pageMetaDescription = "";
  }

  componentDidMount() {
    // this.test();
  }

  test() {

    // Each API may support multiple version. With this sample, we're getting
    // v1 of the urlshortener API, and using an API key to authenticate.
    
  }

  render() {
    return (
      <div className={this.pageClassName}>
        {generateHelmet(this.pageMetaDescription)}
        <Header/>
        <div className="white-background">
          <div className="content centered wide">
            <h1>TEST</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default TestPage;
