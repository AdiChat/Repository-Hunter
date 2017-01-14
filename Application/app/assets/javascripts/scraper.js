

IDENTITY = ''
GITHUB = 'https://api.github.com/';

var Scraper = function() {
    this.getUserData = function(USER, $el, user_def) {
        
        var forks = 0,
            stars = 0,
            subscribers = 0,
            createdAt,
            userData,
            followers = 0,
            commits = 0,
            watchers = 0,
            repos = 0,
            orgs = 0,
            gists = 0,
            elChild = $el.find('.columns');

        var promises = [];
        var defer = $.Deferred();
        promises.push();

        promises.push($.get(GITHUB + 'users/' + USER + IDENTITY, function(data) {
            data = data.data;
            followers = data.followers;
            createdAt = data.created_at;
            repos = data.public_repos;
            gists = data.public_gists;
            userData = data;
        }, 'jsonp'));

        var promise_count = 0;

        $el.show();

        promises.push($.Deferred(
            function(def) {
                getRepoData(GITHUB + 'users/' + USER + '/repos' + IDENTITY + '&per_page=100', def);
            }
        ));

        function getRepoData(url, def) {
            $.get(
                url,
                function(resp, status, obj) {
                    data = resp.data;
                    for(var i = 0; i < data.length; i++) {
                        var e = data[i];
                        if(e.size > 0) {

                            if(e.forks_count) forks += e.forks_count;
                            
                            if (e.stargazers_count) stars += e.stargazers_count;

                            if (e.watchers) watchers += e.watchers_count;

                            elChild.append('<h5 data-name="' + e.name + '">'
                                + e.name + '</h5>');
                        }
                    }

                    var next= hasNext(resp.meta.Link);

                    if(next.hasNext) {
                        getRepoData(next.nextLink, def);
                    } else {
                        def.resolve();
                        $.when.apply(null, promises).done(function(args1, args2) {
                            user_def.resolve({
                                age: createdAt,
                                followers: followers,
                                forks: forks,
                                stars: stars,
                                commits: commits,
                                watchers: watchers,
                                repositories: repos,
                                organiations: orgs,
                                gists: gists
                            });
                        });
                    }
                },
                'jsonp');
        }

        function hasLast(linkHeader) {
            var last = false;
            var lastNumber;
            linkHeader.split(',').forEach(function(e) {
                var linkParts = e.split(';');
                var verb = linkParts[1].match(/rel=\"(.*)\"/)[1];
                if(verb == 'last') {
                    last = true;
                    lastNumber = parseInt(linkParts[0].match(/page=(.*)&/)[1]);
                    lastLink = linkParts[0].match(/\<(.*)\>/)[1];
                }
            });
            return {
                hasLast: last,
                lastNumber: lastNumber,
                lastLink: lastLink
            }
        }

        function hasNext(linkHeader) {
            var next = false;
            var nextLink;
            if(linkHeader) {
                linkHeader.forEach(function(e) {
                    var verb = e[1].rel;
                    if(verb == 'next') {
                        next = true;
                        nextLink = e[0];
                    }
                });
            }
            return {
                hasNext: next,
                nextLink: nextLink
            }
        }
    }
}