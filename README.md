# Tiny Bad Choices Become Big Bad Choices Over time

[Behold](https://jestingrabbit.github.io/), another badly implemented tic-tac-toe player

Probably the most interesting thing about my project (a simple static
tic-tac-toe player with no images or any other resources besides my own code and
jquery), is the method for determining winners.

A while back I was introduced to an odd game. Imagine that there are nine cards,
with numbers on them, from -4 to 4 and all the whole numbers in between. The game
consists of you and I taking turns choosing a card (of known value ie its not
random or anything) and moving it into our hand. A hand is a winner if it contains
a meld, which in this case is three cards whose sum is 0. What game are we really
playing?

     1  2 -3
    -4  0  4
     3 -2 -1

Think about it. It'll come to you.

## Unfinished Business.

What I really wanted to get done in the three and a half days that we had to
write this was coding up a real ai. A real ai isn't something that you code to within
an inch of its life, telling it what to do in all cases. A real ai can surprise you.
[MENACE](http://brainwagon.org/2011/08/28/donald-michie-alan-turing-martin-gardner-and-tic-tac-toe/)
(that's not a good link, sorry) which was made of matchboxes and jellybeans, which
I remember seeing talked about on the curiosity show, is
a real tic-tac-toe ai.

I also found out that the romans played a similar game, but with three counters
each, and after your first three moves you had to pick up a counter to make your
next move. I wonder what perfect play of that game looks like? I wonder how to train
an agent to play that? That would be really interesting, but... welp.

At least the code works. Also, please don't resize it. Or look at it on a mobile.
Or use it on IE8 or... well, you get the idea.
