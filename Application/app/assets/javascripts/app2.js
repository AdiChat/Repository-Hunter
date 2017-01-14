
//4e7359d229f0b2ccf10bbdfa1cc78565c4844b9e

var stats = ['age', 'stars', 'forks', 'commits', 'repositories', 'gists', 'followers'],
 users = [];
 cou = 0;

 score_org = [];

$(document).ready(function() {    

    $('#submit').click(fillusers);

});

function fillusers() {
    var form = document.forms[0];
    var link = 'https://api.github.com/orgs/'+$(form['organization']).val()+'/public_members?per_page=100&page=';

    var count = 1;
    var check_data = '';
    var promises1 = [];
    var ccff = 0;

    do
    {
        console.log(count);

            $.getJSON(link+count, function(json){
                users_follow = json; 
                check_data = json;
                outputPageContent1(); 
              });
        count++;
    }while(count < 5);

    function outputPageContent1() {

        console.log("pp");

        if(users_follow.length == 0) { if(ccff == 0){ ccff=1; users.push("eviladichat");} else { ccff=1; }}
        else {
          $.each(users_follow, function(index) {
            users.push(users_follow[index].login);
            console.log(users.length);
          });
        }
      } 

      console.log(users);

     
      function checkIfFinished(){
    return($.inArray("eviladichat", users)>-1);
    }

      var timeout = setInterval(function() 
        { if(checkIfFinished()) 
            { 
            clearInterval(timeout); 
            isFinished = true; 
            console.log("meow"); 
            var index = $.inArray("eviladichat", users);
            if (index > -1) {
                users.splice(index, 1);
            }
            visualize();
        } }, 100);

    
}

function visualize() {

    var scraper = new Scraper();
    var $this = $(this);
    var $graphsContainer = $('.graphs-container');
    var form = document.forms[0],
        promises = [],
        valid = true;

    var fail = false;
    var storage = typeof(Storage)!=="undefined";

    

    for(var i = 0; i < users.length; i++) 
    {
        if(users[i] == "") 
        {
            $(form['user_' + (i + 1)]).css('border', '5px solid rgb(186, 0,0)');
            valid = false;
            $('#submit').text('INVALID');
        } 
        else 
        {
            promises.push($.Deferred(function(def) {
                var key = i + 1;
                $.ajax({
                    url: GITHUB + 'users/' + users[i] 
                    + IDENTITY + '&callback=?',
                    success: function(data) {
                        if (data.data && data.data.message == "Not Found") {
                            $(form['user_' + key]).css('border', '5px solid rgb(186, 0,0)');
                            fail = true;
                        } else {
                            // #6 - Use the login for all future requests
                            users[key-1] = data.data.login;
                        }
                        def.resolve();
                    },
                    dataType: 'jsonp'
                });
            }));  
        }
    }

    if(!valid) {
        users = [];
        return false;
    }

    $.when.apply(null, promises).done(function () {
        if(fail) {
            users = [];
            $('#submit').text('INVALID');
            return false;
        } else {
            $('input').css('border', 'none');
            promises = [];
            $('#submit').unbind('click');
            $('.user2 input, .user1 input').unbind('keypress');
            $this.css('cursor', 'default');

            var $fight = $('#submit'),
            count = 0;
            $fight.html("<span>Comparing people just for you </span><div>(this can take some time)</div>");

            for(var i = 0; i < users.length; i++) {
                promises.push(
                    $.Deferred(
                        function(def) {
                            scraper.getUserData(users[i], $('.processing-container'), def);
                        }
                    )
                );
            };          

            cou = 0;

            /*
            for(var i=0; i<users.length; i++) {
                score_org[i] = [];
                score_org[i].push(users[i]);
            }
            */

            sscore_org = [];
            console.log(score_org);
            var ss = 0;
            for(var i=0; i<users.length;) {

                promises[0] = promises[i];
                //console.log(users[i]);
                console.log(i);

                 $.when.apply(null, promises).done(function(u1) {
                    var value = finalScore1(u1);
                    score_org[cou-1] = [];
                    score_org[cou-1].push(value);
                    score_org[cou-1].push(users[cou-1]);
                    //ss = finalScore(u1);
                    console.log(users[cou-1]);          
                    console.log(value);

                    if(cou == users.length)
                    {
                        score_org.sort(sortFunction);

                        function sortFunction(a, b) {
                            return b[0] - a[0];
                        }

                        console.log(99);
                        console.log(score_org);

                        addTable(['score','user'], score_org);

                        //$( "#submit" ).remove();

                        function addTable(columnNames, dataArray) {
                          var myTable = document.createElement('table');
                          $('#submit').text('The ranking of public members is:');
                          
                          document.body.appendChild(myTable);

                          var y = document.createElement('tr');

                          myTable.appendChild(y);

                          for(var i = 0; i < columnNames.length; i++) {
                            var th = document.createElement('th'),
                                columns = document.createTextNode(columnNames[i]);
                            th.className = "head";
                            //th.setAttribute('onclick', 'sorti(this);');
                            th.appendChild(columns);
                            y.appendChild(th);
                          }

                          for(var i = 0 ; i < dataArray.length ; i++) {
                            var row= dataArray[i];
                            var y2 = document.createElement('tr');
                            for(var j = 0 ; j < row.length ; j++) {
                              myTable.appendChild(y2);
                              
                              var th2 = document.createElement('td');
                              var date2;
                              if(j==1)
                                //date2 = $('<a href="https://github.com/'+row[j]+'"></a>').text(row[j]);
                                date2 = document.createTextNode(row[j]);
                              if(j==0)
                                date2 = document.createTextNode(row[j]);
                              th2.appendChild(date2);
                              y2.appendChild(th2);
                                
                            }
                          }

                          document.body.appendChild(document.createElement('br'));
                          document.body.appendChild(document.createElement('br'));
                        } 

                    }   

                }).done(i++);
                
            }
        }
    });
    
}

function setupGraphs(u1, u2, promises, users) {
    var saver = {},
        totals = {
            u1: 0,
            u2: 0
        },
        $form = $(document.forms[0]),
        graphs = [];

    stats.forEach(function (s) {
        var g = setupGraph(u1, u2, s, saver, totals);
        graphs.push(g.hide());
    });
    
    setupWinner(u1, u2);
    displayGraphs($form, graphs, users);

}

function setupGraph(u1, u2, name, saver, totals) {
    var graph = graphTemplate.clone();
    var r = dataFormatter(u1, u2, name, totals);
    saver[name] = r;
    r = normalize(r, name);
    graph.find('.label').text(formattedNames[name]);
    graph.find('.graph_1 h3').text(r.user1.actual);
    graph.find('.graph_2 h3').text(r.user2.actual);
    graph.find('.graph_1').css('width', r.user1.percent + '%');
    graph.find('.graph_2').css('width', r.user2.percent + '%');
    return graph;
}

function displayGraphs(form, graphs, users) {

    $(form).slideUp(500);

    var $graphsContainer = $('.graphs-container')
    $graphsContainer.show();
    countUp($('.result_1 h2'));
    countUp($('.result_2 h2'));
    $('.winner-container').slideDown(2000, function() {
        graphs.forEach(function(g) {
            $graphsContainer.append(g);
            g.slideDown(1000);
        });
       
    });
}

function countUp(el) {
    var id = setInterval(numberCounter, 50);
    var time = 0;
    var number = parseFloat(el.data('total'));
    function numberCounter() {
        position = time / 1500;
            if (time == 1500) {
                clearInterval(id);
            }
        el.text((position * number).toFixed(2));
        time += 50;
    }
}

function setupWinner(u1, u2) {
    var u1Score = finalScore(u1),
        u2Score = finalScore(u2);
    $('.result_1 h3').html("<a href=\"https://github.com/"+users[0]+"\">"+users[0]+"</a>");
    $('.result_2 h3').html("<a href=\"https://github.com/"+users[1]+"\">"+users[1]+"</a>");
    $('.result_1 h2').text(0);
    $('.result_2 h2').text(0);
    $('.result_1 h2').data('total', u1Score);
    $('.result_2 h2').data('total', u2Score);
    var twitter;
    if(parseFloat(u1Score) > parseFloat(u2Score)) {
        $('.result_2 h3, .result_2 h2').addClass('loser');
        $('.result_1 h3, .result_1 h2').addClass('winner');
        twitter = twitterTemplate(users[0], users[1], u1Score, u2Score);
    } else {
        $('.result_1 h3, .result_1 h2').addClass('loser');
        $('.result_2 h3, .result_2 h2').addClass('winner');
        twitter = twitterTemplate(users[1], users[0], u2Score, u1Score);
    }
    if(typeof twttr !== 'undefined') {
        $('.retry-container').prepend(twitter);
        twttr.widgets.load();
    }
}

var graphTemplate = $("<div class='graph-container'> \
                        <div class='twelve columns'> \
                            <h3 class='label'>Commits</h3> \
                        </div> \
                        <div class='twelve columns'> \
                            <div class='graph_1 graph'><h3>63</h3></div> \
                            <div class='graph_2 graph'><h3>20</h3></div> \
                        </div> \
                    </div>");

function twitterTemplate(w, l, wScore, lScore)  {
    return $("<div class='twitter'> \
                            <a href='https://twitter.com/share' \
                             data-text='" + w +" just beat " + l + " on GitBattle " + 
                             wScore + " to " + lScore + ". Battle now to see if you can beat either of them:'\
                             class='twitter-share-button' data-counturl='gitbattle.com' data-lang='en' data-url='http://www.gitbattle.com?u1=" + w + "&u2=" + l + "' data-size='medium' data-count='vertical'>Tweet</a> \
                        <h5>about your victory (or loss)</h5> \
                        </div>");
} 


var formattedNames = {
    'age': 'Age (days)',
    'forks': 'Forks/repo',
    'stars': 'Stars/repo',
    'commits': 'Commits/day',
    'repositories': 'Repos',
    'gists': 'Gists',
    'followers': 'Followers'
}

function normalize(r, name) {
    if(r.user1.percent < 10) {
        r.user1.percent = 15;
        r.user2.percent = 84;
    } else if (r.user2.percent < 10) {
        r.user2.percent = 15;
        r.user1.percent = 84;
    } else if (r.user2.percent + r.user1.percent === 100) {
        r.user1.percent -= 1;
    }
    if(name == 'commits' || name == 'stars' || name == 'forks') {
        if(r.user1.actual == 0) r.user1.actual = '~0';
        if(r.user2.actual == 0) r.user2.actual = '~0';
    }
    if(name === 'gists') {
        if(r.user1.actual > 100) r.user1.actual = '100+';
        if(r.user2.actual > 100) r.user2.actual = '100+';
    }
    return r;
}

function dataFormatter(user1, user2, stat) {
    if(stat == 'age') {
        var init_date_1 = Date.parse(user1.age),
            init_date_2 = Date.parse(user2.age),
            today = Date.parse(new Date());
        var diff1 = Math.floor(((today - init_date_1) / 86400000)),
            diff2 = Math.floor(((today - init_date_2) / 86400000));
        var dp1 = Math.floor(diff1 / (diff1 + diff2) * 100),
            dp2 = Math.floor(diff2 / (diff1 + diff2) * 100);

        return {
            user1: {
                "actual" : diff1,
                "percent" : dp1
            },
            user2: {
                "actual" : diff2,
                "percent": dp2
            }
        }
    } else if (stat == 'forks' || stat == 'stars') {
        if(user1.repositories !== 0) {
            var ratio1 = Math.round((user1[stat] / user1.repositories * 10)) / 10;
        } else {
            var ratio1 = 0;
        }
        if(user2.repositories !== 0) {
            var ratio2 = Math.round((user2[stat] / user2.repositories * 10)) / 10;
        } else {
            var ratio2 = 0;
        }

        if(ratio1 + ratio2 == 0) {
            var dp1 = 50,
                dp2 = 50;
        } else {
            var dp1 = Math.floor((ratio1 / (ratio1 + ratio2)) * 100),
                dp2 = Math.floor((ratio2 / (ratio1 + ratio2)) * 100);   
        }

        return {
            user1: {
                "actual" : ratio1,
                "percent" : dp1
            },
            user2: {
                "actual" : ratio2,
                "percent": dp2
            }
        }; 
    } else if (stat == 'commits') {
            var init_date_1 = Date.parse(user1.age),
            init_date_2 = Date.parse(user2.age),
            today = Date.parse(new Date());
            var diff1 = Math.floor(((today - init_date_1) / 86400000)),
                diff2 = Math.floor(((today - init_date_2) / 86400000)); 
            if (diff1 !== 0 && user1.commits !== 0) {
                var ratio1 = Math.floor((user1.commits / diff1 * 10)) / 10;
            } else {
                var ratio1 = 0;
            }

            if (diff2 !== 0 && user2.commits !== 0) {
                var ratio2 = Math.floor((user2.commits / diff2 * 10)) / 10;
            } else {
                var ratio2 = 0;
            }

            if (ratio1 + ratio2 === 0) {
                var dp1 = 50,
                    dp2 = 50;
            } else {
                var dp1 = Math.floor((ratio1 / (ratio1 + ratio2)) * 100),
                    dp2 = Math.floor((ratio2 / (ratio1 + ratio2)) * 100);   
            }

            return {
                user1: {
                    "actual" : ratio1,
                    "percent" : dp1
                },
                user2: {
                    "actual" : ratio2,
                    "percent": dp2
                }
            };
    } else if (stat === 'gists' || stat === 'repositories' || stat === 'followers') {
        var total = (user1[stat] + user2[stat]);
        if (total === 0) {
            var dp1 = 50, 
                dp2 = 50;
        } else {
            var dp1 = Math.floor(user1[stat] / total * 100);
            var dp2 = Math.floor(user2[stat] / total * 100);
        }

        return {
            user1: {
                'actual': user1[stat],
                'percent': dp1
            },
            user2: {
                'actual': user2[stat],
                'percent': dp2
            }
        }
    }
}

function finalScore(user) {
    return 1;
}

function finalScore1(user) {

    ++ cou;

    var time = user.age, 
        repos = user.repositories, 
        commits = user.commits, 
        forks = user.forks, 
        stars = user.stars, 
        followers = user.followers,
        watchers = user.watchers,
        gists = user.gists;

    // all times in seconds
    var github_founding_time = 1206835200
        user_init_time = (Date.parse(time) / 1000),
        now_time = (Date.parse(new Date()) / 1000),
        diff_time = now_time - user_init_time;

    /*
    * Perfect scores are in ()
    */

    var raw_score_followers = Math.sqrt(followers / repos) ;

    if (raw_score_followers > 5)
        raw_score_followers = 5;

    if (now_time - github_founding_time != 0) 
        var raw_score_age = (now_time - user_init_time) / (now_time - github_founding_time);
    else 
        var raw_score_age = 0;

    var raw_score_repo = 0;
    if(repos > 100)
        raw_score_repo = 1;
    else
        raw_score_repo = (repos/100);

    
    if (repos > 0) 
    {
        var raw_score_fpr = Math.sqrt(forks / repos) / 15;
        if(raw_score_fpr > 1) 
            raw_score_fpr = 1;
    } else {
        var raw_score_fpr = 0;
    }

    if (repos > 0) {
        var raw_score_spr = Math.sqrt(stars / repos) / 31;
        if(raw_score_spr > 1) {
            raw_score_spr = 1;
        }
    } else {
        var raw_score_spr = 0;
    }

    var final_score = ((raw_score_age * 0.1) + (raw_score_repo * 0.1) + (raw_score_fpr * 0.5) + (raw_score_spr * 0.7) + raw_score_followers * 0.1) * 100;

    return final_score.toFixed(2);
}