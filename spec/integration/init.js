var assert = require('assert'),
    client = require('fakeredis').createClient('test'),
    repo = require('../data/repository');

describe('Repository Test', function(){

  beforeEach(function(){
    client.flushdb();
  });

  afterEach(function(){
    client.flushdb();
  });

  it('should add shaders for getShader', function(done){
    var noUsername = repo.getShader('default:users:bruce', client);
    noUsername.done(null, function(err){
      assert.equal(err, 'Username is null');
    });

    //setup the data
    client.set('default:users:bruce', 'bruce');
    client.set('default:users:bruce:shader', JSON.stringify({test: 'test'}));

    //make sure the function gets the correct keys
    var getShader = repo.getShader('default:users:bruce', client);
    getShader.done(function(shader){
      assert.equal(shader.username, 'bruce');
      assert.equal(shader.fs.test, 'test');
      done();
    });
  });

  it('should return shaders with getShaders', function(done){
    var empty = repo.getShaders('default', client);
    empty.done(function(shaders){
      assert.equal(shaders.length, 0);
    });

    //set data
    client.sadd('default:shaders', 'default:users:bruce');
    client.set('default:users:bruce', 'bruce');
    client.set('default:users:bruce:shader', JSON.stringify({test: 'test'}));

    var oneShader = repo.getShaders('default', client);
    oneShader.done(function(shaders){
      assert.equal(shaders.length, 1);
      var shader = shaders[0];
      assert.equal(shader.username, 'bruce');
      assert.equal(shader.fs.test, 'test');
      done();
    });
  });

  it('should remove the user with removeUser', function(done){
    client.sadd('default:users', 'default:users:bruce');

    var rem = repo.removeUser('bruce', 'default', client);
    rem.done(function(){
      client.smembers('default:users', function(err, users){
        assert.equal(users.length, 0);
        done();
      })
    });
  });

  it('setUser should set username', function(done){
    var user = repo.setUser('bruce', 'default', 7200, client);
    user.done(function(){
      client.get('default:users:bruce', function(e, d){
        assert.equal(d, 'bruce');
        done();
      });
    });
  });

  it('should set a string in the set', function(done){
    var user = repo.setUser('bruce', 'default', 7200, client);
    user.done(function(){
      client.smembers('default:users', function(e, d){
        assert.equal(d.length, 1);
        done();
      });
    });
  });

  it('should set ttl on the key', function(done){
    var user = repo.setUser('bruce', 'default', 7200, client);
    user.done(function(){
      client.ttl('default:users:bruce', function(e, d){
        //make sure a ttl is set
        assert.equal(d <= 7200, true);
        assert.equal(d > 1, true);
        done();
      });
    });
  });

  it('should expire the user key', function(done){
    var user = repo.setUser('bruce', 'default', 0, client);
    user.done(function(){
      client.get('default:users:bruce', function(e, d){
        assert.equal(d, null);
        client.scard('default:users', function(e, d){
          assert.equal(d, '0');
          done();
        });
      });
    });
  });

  it('should set shader', function(done){
    var shader = repo.setShader('bruce', 'default', {test: 'test'}, 7200, client);
    shader.done(function(){
      client.get('default:users:bruce:shader', function(e, d){
        assert.equal(JSON.parse(d).test, 'test');
        client.scard('default:shaders', function(e, d){
          assert.equal(d, '1');
          done();
        });
      });
    });
  });

  it('should expire the shader key', function(done){
    var user = repo.setShader('bruce', 'default', {test: 'test'}, 0, client);
    user.done(function(){
      client.get('default:users:bruce:shader', function(e, d){
        assert.equal(d, null);
        client.scard('default:shaders', function(e, d){
          assert.equal(d, '0');
          done();
        });
      });
    });
  });
});
