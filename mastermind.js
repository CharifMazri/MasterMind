var app = angular.module("masterApp", ['ngDialog']);

app.controller("masterCtrl", function($scope, ngDialog, $filter) {

    $scope.gameEnd = false;
    $scope.solution = null;
    $scope.userSolutionStacks = null;
    $scope.userCurrentSolution = null;
    $scope.canConfirm = false;
    $scope.rules = {
        traySize: 4,
        maxRound: 10
    };

    $scope.choices = [
        {
            id: 0,
            name: 'blue',
            color: '#0000FF'
        },
        {
            id: 1,
            name: 'red',
            color: '#FF0000'
        },
        {
            id: 2,
            name: 'yellow',
            color: '#FFFF00'
        },
        {
            id: 3,
            name: 'orange',
            color: '#FFA500'
        },
        {
            id: 4,
            name: 'green',
            color: '#008000'
        },
        {
            id: 5,
            name: 'black',
            color: '#000000'
        }
    ];


    function initGame() {
        $scope.gameEnd = false;
        $scope.solution = [];
        $scope.userSolutionStacks = [];
        $scope.userCurrentSolution = [];

        for (var i = 0;i < $scope.rules.traySize; i++) {
            $scope.solution.push($scope.choices[Math.floor((Math.random() * ($scope.choices.length - 1)) + 0)]);
        }
    }
    initGame();

    function checkWin(rules, correctValue) {
        if (correctValue === rules.traySize) {
            return true;
        }

        return false;
    }

    function playerWin(status) {
        $scope.gameEnd = true;
        var tmp = "";
        if (status === true) {
            tmp = "<div>Congratulations, you won in {{nbRounds}} rounds!</div>"
        } else {
            tmp = "<div>Sorry, you lost in {{nbRounds}} rounds!</div>"
        }

        ngDialog.open(
            {
                template: tmp,
                plain: true,
                className: 'ngdialog-theme-default',
                controller: ['$scope', 'nbRounds', function($scope, nbRounds) {
                    $scope.nbRounds = nbRounds;
                }],
                resolve: {
                    nbRounds: function () {
                        return $scope.userSolutionStacks.length;
                    }
                }
            });

    }

    $scope.retry = function() {
        initGame();
    };

    function getIndexByElement(pin, array) {
        for (var x=0;x<array.length;x++) {
            if (pin.id === array[x].id) {
                return x;
            }
        }
        return -1;
    }

    $scope.confirm = function() {

        var correct = 0;
        var wrongPlace = 0;
        var solutionCopy = angular.copy($scope.solution);
        var userSolutionCopy = angular.copy($scope.userCurrentSolution);

        for (var x = 0;x < userSolutionCopy.length;x++) {
            if (userSolutionCopy[x].id === solutionCopy[x].id) {
                ++correct;
                solutionCopy = solutionCopy.filter(function(item, keyf) { return keyf !== x; });
                userSolutionCopy = userSolutionCopy.filter(function(item, keyf) { return keyf !== x; });
                --x;
            }
        }

        for (var x = 0;x < userSolutionCopy.length;x++) {
            var solIndex;
            if ((solIndex = getIndexByElement(userSolutionCopy[x], solutionCopy)) >= 0) {
                solutionCopy = solutionCopy.filter(function(item, keyf) { return keyf !== solIndex; });
                userSolutionCopy = userSolutionCopy.filter(function(item, keyf) { return keyf !== x; });
                ++wrongPlace;
                --x;
            }
        }

        $scope.userSolutionStacks.push({
            solution: $scope.userCurrentSolution,
            correct: correct,
            wrongPlace: wrongPlace
        });
        $scope.userCurrentSolution = [];
        $scope.canConfirm = false;

        if (checkWin($scope.rules, correct)) {
            playerWin(true);
        } else if ($scope.userSolutionStacks.length >= $scope.rules.maxRound) {
            playerWin(false);
        }

    };

    $scope.selectChoice = function(index) {
        ngDialog.open(
            {
                template: "<div style='max-width: 100%;overflow-x: scroll;'><svg height='100' ng-attr-width='{{85 * colors.length}}'>" +
                "<g ng-repeat='pin in colors track by $index' ng-attr-transform='translate({{(($index) * 80)}},0)'>" +
                "<circle  cx='50' cy='50' r='40' stroke='black' stroke-width='3' ng-attr-fill='{{pin.color}}' ng-click='closeThisDialog(pin)' />" +
                "</g></svg></div>",
                plain: true,
                className: 'ngdialog-theme-default',
                controller: ['$scope', 'colors', function($scope, colors) {
                    $scope.colors = colors;
                }],
                resolve: {
                    colors: function () {
                        return $scope.choices;
                    }
                }
            }
        ).closePromise.then(function (data) {
            if (data.value && typeof data.value === 'object') {
                $scope.fill(index, data.value);
            }

            if ($scope.userCurrentSolution.filter(function(value) { return value !== undefined }).length >= $scope.rules.traySize) {
                $scope.canConfirm = true;
            }
        });
    };

    $scope.fill = function(index, value) {

        if (!index && !value) {
            return;
        }

        if (!$scope.userCurrentSolution.hasOwnProperty(index)) {
            $scope.userCurrentSolution[index] = [];
        }

        $scope.userCurrentSolution[index] = value;
    }
});
