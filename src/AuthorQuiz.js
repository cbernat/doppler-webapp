import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap.min.css'

import HeaderNav from './components/Header/Nav';

function Hero() {
  return (
    <div className="row">
      <div className="jumbotron col-10 offset-1">
        <h1>Autohor Quiz</h1>
        <p>Select </p>
      </div>
    </div>
  );
}

function Turn({autor, books}) {
 return(
 <div className="row turn" style={{backgroundColor: "white"}}>
  <div className="col-4 offset-1">
    <img src={author.imageUrl} className="authorimage" alt="Author"/>
  </div>
  <div className="col-6">
    {books.map((title) => <p>{title}</p>)}
  </div>
 </div>);
}

function Continue() {
  return(<div></div>);
}

function Footer(){
  return (
    <div id="Footer" className="row">
      <div className="col-12">
        <p className="text-muted credit">
          All Images are from <a href="http://goolgle.com">Google</a>
        </p>
      </div>
    </div>
  );
}

class AuthorQuiz extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Hero/>
        <Turn/>
        <Continue/>
        <Footer />
      </div>
    );
  }
}

export default AuthorQuiz;
