

var stats = ['age', 'stars', 'forks', 'repositories', 'gists', 'followers'],
 users = [];

$(document).ready(function() {
    
    $('#submit').click(visualize);

});

function visualize(e) {

    var scraper = new Scraper();
    var $this = $(this);
    var $graphsContainer = $('.graphs-container');
    var form = document.forms[0],
        promises = [],
        valid = true;

    var fail = false;
    var storage = typeof(Storage)!=="undefined";

    users.push($(form['user_1']).val());
    users.push($(form['user_2']).val());

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
            $fight.html("<span>Processing...</span><div>(this can take some time)</div>");

            for(var i = 0; i < users.length; i++) {
                promises.push(
                    $.Deferred(
                        function(def) {
                            scraper.getUserData(users[i], $('.processing-container'), def);
                        }
                    )
                );
            };          

            $.when.apply(null, promises).done(function(u1, u2) {
                setupGraphs(u1, u2, users);
            });

        }
    });
    
}

function setupGraphs(u1, u2, users) {
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

    $(form).slideUp(0);

    var $graphsContainer = $('.graphs-container')
    $graphsContainer.show();
    countUp($('.result_1 h2'));
    countUp($('.result_2 h2'));
    $('.winner-container').slideDown(0, function() {
        graphs.forEach(function(g) {
            $graphsContainer.append(g);
            g.slideDown(0);
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
    } else {
        $('.result_1 h3, .result_1 h2').addClass('loser');
        $('.result_2 h3, .result_2 h2').addClass('winner');
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

var formattedNames = {
    'age': '👵 Age 👴',
    'forks': '🍴 Forks 🍴',
    'stars': '🌟 Stars 🌟',
    'repositories': '🔖 Repositories 🔖',
    'gists': '📎 Gists 📎',
    'watchers': 'watchers',
    'followers': '🎈 Followers 🎈'
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
                "actual" : user1[stat],
                "percent" : dp1
            },
            user2: {
                "actual" : user2[stat],
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
    } else if (stat === 'gists' || stat === 'repositories' || stat === 'followers' || stat == 'watchers') {
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

    // add weights
    var final_score = ((raw_score_age * 0.1) + (raw_score_repo * 0.1) + (raw_score_fpr * 0.5) + (raw_score_spr * 0.7) + raw_score_followers * 0.1) * 100;

    return final_score.toFixed(2);
}