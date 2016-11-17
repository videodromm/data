/*jshint unused:false */
var UserImage = React.createClass({
  usernameToImg: function (user) {
    var src, username;
 
    username = user;

    var emailhash = md5(username.toLowerCase());
    src = 'http://www.gravatar.com/avatar/' + emailhash + '?d=retro&s=18';

    return {
      src: src,
      username: username
    };
  },
  render: function () {
    var imgOutput = this.usernameToImg(this.props.username);
    var name = this.props.useName ? imgOutput.username + ': ' : null;
    return React.DOM.span(null,
      [React.DOM.img({src: imgOutput.src, className: 'userimg', title: imgOutput.username }, null),
        name]);
  }
});

var UserDisplay = React.createClass({
  signoutUser: function () {
    $(window).trigger('SignoutUser');
  },
  handleClick: function (event) {
    event.preventDefault();
    this.signoutUser();
  },
  render: function () {

    return React.DOM.div(null,
      [React.createElement(UserImage, {username: this.props.username, useName: true}),
        React.DOM.a({href: '#', onClick: this.handleClick}, 'Sign out')]);
  }
});

var UserLogin = React.createClass({
  addUser: function (user) {
    $(window).trigger('AddUser', user);
  },
  handleBlur: function (event) {
    var val = event.target.value;
    if (val !== '') {
      this.addUser(val);
    }
  },
  render: function () {
    return React.DOM.input({
      id: 'login',
      type: 'text',
      placeholder: 'gravatar',
      onBlur: this.handleBlur
    }, null);
  }
});

var LoginForm = React.createClass({
  componentWillMount: function(){
    this.boundNewUser = this.newUser.bind(this);
    $(window).on('NewUser.React', this.boundNewUser);
  },
  getInitialState: function(){
    return {
      user: this.props.user
    };
  },
  processUser: function (user) {
    var loggedIn = (user !== undefined && user !== null),
      newUser = null;

    if (loggedIn) {
      newUser = user;
    }

    return {
      loggedIn: loggedIn,
      user: newUser
    };
  },
  newUser: function(e, user){
    this.setState({user: user});
  },
  componentWillUnmount: function () {
    $(window).off('NewUser.React', this.boundNewUser);
  },
  render: function () {
    var processState = this.processUser(this.state.user);
    var userComponent = processState.loggedIn ? React.createElement(UserDisplay, {username: this.state.user.username})
      : React.createElement(UserLogin, null);
    return React.DOM.div(null,
      [userComponent]);
  }
});

var ShaderWell = React.createClass({
  shaderSearch: function (search) {
    $(window).trigger('ShaderSearch', search);
  },
  clearShaderSearch: function () {
    $(window).trigger('ClearShaderSearch');
  },
  searchClickHandler: function (event) {
    event.preventDefault();
    var val = this.refs['fragSearch'].getDOMNode().value;
    if (val !== '') {
      this.shaderSearch(val);
    } else {
      this.shaderSearch('shader');
    }
  },
  clearClickHandler: function (event) {
    event.preventDefault();
    this.clearShaderSearch();
    this.refs['fragSearch'].getDOMNode().value = '';
  },
  render: function () {
    return React.DOM.form({className: 'form-search', onSubmit: this.searchClickHandler},
      [React.DOM.input({
        type: 'text',
        className: 'input-medium search-query',
        placeholder: 'search or leave blank',
        ref: 'fragSearch'
      }, null),
        React.DOM.button({
          className: 'btn',
          onClick: this.searchClickHandler
        }, React.DOM.i({className: 'icon-search'}, null)),
        React.DOM.button({
          className: 'btn',
          onClick: this.clearClickHandler
        }, React.DOM.i({className: 'icon-remove'}, null))]);
  }
});

var ShaderDisplay = React.createClass({
  vote: function (fs) {
    $(window).trigger('Vote', fs);
  },
  handleClick: function (event) {
    event.preventDefault();
    this.vote(this.props.fs);
  },
  render: function () {
    var fs = this.props.fs;
    var img, phone, menu, votes, users = [];
    if (fs.categories.length > 0) {
      img = React.DOM.img({src: fs.categories[0].icon.prefix + 'bg_32' + fs.categories[0].icon.suffix}, null);
    } else {
      img = React.DOM.img({src: 'images/marker.png'}, null);
    }
    if (fs.user !== undefined) {
      votes = React.DOM.div(null, 'Votes: ' + fs.user.length);
      users = fs.user.slice();
    } else {
      votes = React.DOM.div(null, 'Votes: 0');
    }

    return React.DOM.div(null,
      [React.DOM.h3(null, img, fs.name),
        votes,
        React.DOM.div(null,
          users.map(function (u) {
            return React.createElement(UserImage, {username: u.username, useName: false});
          })
        ),
        React.DOM.button({className: "btn", onClick: this.handleClick}, 'Vote for ' + fs.name)
      ]);
  }
});

var VoteDisplay = React.createClass({
  showShader: function (fsid) {
    $(window).trigger('ShowShader', fsid);
  },
  handleClick: function (e, index) {
    this.showShader(this.props.votes[index][2]);
  },
  render: function () {
    var partialHandle = function (fn, index) {
      return function (e) {
        return fn(e, index);
      };
    };

    return React.DOM.ul({id: 'votes'},
      this.props.votes.map(function (vote, index) {
          return React.DOM.li(null,
            [React.DOM.div({onClick: partialHandle(this.handleClick, index)}, vote[3].length + ' for ' + vote[0]),
              vote[3].map(function (user) {
                return React.createElement(UserImage, {username: user.username, useName: false});
              })]
          );
        }.bind(this)
      )
    );
  }
});

var ActivityDisplay = React.createClass({
  componentWillMount: function () {
    this.boundAddVote = this.addVote.bind(this);
    $(window).on('ServerVote.React', this.boundAddVote);
  },
  getInitialState: function () {
    return {
      votes: []
    };
  },
  addVote: function (event, data) {
    var newState = this.state.votes.slice();
    newState.push(data);
    this.setState({votes: newState});
  },
  showShader: function (fsid) {
    $(window).trigger('ShowShader', fsid);
  },
  handleClick: function (index) {
    this.showShader(this.state.votes[index].id);
  },
  componentWillUnmount: function () {
    $(window).off('ServerVote.React', this.boundAddVote);
  },
  render: function () {
    return React.DOM.ul({id: 'acts'},
      this.state.votes.map(function (vote, index) {
          return React.DOM.li({key: index},
            [React.DOM.div({onClick: this.handleClick.bind(this, index)},
              React.createElement(UserImage, {username: vote.user.username, useName: false}),
              vote.user.username + ' voted for ' + vote.name),
              React.DOM.hr(null, null)
            ]);
        }.bind(this)
      ));
  }
});

//for jsLint these are defined in other files
//except vd that is here in the self executing functions

/*global L:true vd:true md5:true io: true */

(function (vd) {
  "use strict";
  vd.Cookie = {};
  vd.Cookie.createCookie = function (name, value, days) {
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    else {
      expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  vd.Cookie.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };

  vd.Cookie.eraseCookie = function (name) {
    vd.Cookie.createCookie(name, "", -1);
  };
})(window.vd = window.vd || {});

(function (vd, $) {
  "use strict";
  var sock,
    listeners = [];

  vd.Socket = function (socket) {
    return init(socket);
  };

  var init = function (socket) {
    //DI
    sock = socket;

    var addEvent = function (name, obj) {
      var proxy = function (d) {
        $(obj).trigger(name, d);
      };
      sock.on(name, proxy);
      listeners.push({name: name, func: proxy});
    };

    var addUser = function (username, area, cb) {
      sock.emit('add', username, area, function () {
        cb();
      });
    };

    var addVote = function (fs) {
      //make a copy of the object to send to the server
      //we only need basic info as the frag will be
      //built client side
      var fsSend = $.extend(true, {}, fs);
      //delete what we don't need
      delete fsSend.marker;
      delete fsSend.user;
      sock.emit('addVote', fsSend);
    };

    var getUsers = function () {
      sock.emit('get');
    };

    var getVotes = function () {
      sock.emit('getVotes');
    };

    var removeListeners = function () {
      for (var i = 0; i < listeners.length; i++) {
        sock.removeListener(listeners[i].name, listeners[i].func);
      }
    };

    return {
      addEvent: addEvent,
      addUser: addUser,
      addVote: addVote,
      getUsers: getUsers,
      getVotes: getVotes,
      removeListeners: removeListeners
    };
  };
})(window.vd = window.vd || {}, window.jQuery);



(function (vd, $) {
  "use strict";
  vd.Votes = function () {
    this.votes = {};
    this.users = {};
  };

  vd.Votes.prototype = {
    addVote: function (vote) {
      var userVote = this.findByUser(vote.user[0].username);

      if (userVote !== undefined) {
        var fsVote = this.findByFs(userVote);

        fsVote.user = this.removeFromArray(vote.user[0].username, fsVote.user);
      }

      this.users[vote.user[0].username] = vote.id;

      var newVote = this.findByFs(vote.id);
      if (newVote === undefined) {
        this.votes[vote.id] = vote;
        newVote = vote;
      } else {
        newVote.user.push(vote.user[0]);
      }

      this.cleanUpShaders();
    },

    cleanUpShaders: function () {
      for (var i in this.votes) {
        if (this.votes[i].user.length === 0) {
          $(this).trigger('removeLayer', this.votes[i].marker);
          delete this.votes[i];
        }
      }
    },

    findByFs: function (fsid) {
      return this.votes[fsid];
    },

    findByUser: function (username) {
      return this.users[username];
    },

    removeFromArray: function (username, users) {
      var newArray = [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username !== username) {
          newArray.push(users[i]);
        }
      }
      return newArray;
    }
  };
})(window.vd = window.vd || {}, window.jQuery);
