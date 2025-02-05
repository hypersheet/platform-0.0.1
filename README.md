[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_shield)
![banner](https://user-images.githubusercontent.com/185555/88729229-76ac1280-d187-11ea-81c6-14146ec64848.png)

[Monorepo](https://en.wikipedia.org/wiki/Monorepo) for [@platform](https://www.npmjs.com/org/platform) modules.

<p>&nbsp;</p>
<p>&nbsp;</p>



# Philosophy

As quoted on [@isaacs](https://www.npmjs.com/~isaacs) post ["Unix Philosophy and Node.js"](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs), [Doug McIlroy's](https://en.wikipedia.org/wiki/Douglas_McIlroy) 4-point formulation of the [Unix Philosophy](http://www.catb.org/esr/writings/taoup/html/ch01s06.html):

<p>&nbsp;</p>

1. **Make each program do one thing well.**  
   To do a new job, build afresh rather than complicate old programs by adding new features.


2. **Expect the output of every program to become the input to another, as yet unknown, program.**  
   Don’t clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don’t insist on interactive input.


3. **Design and build software, even operating systems, to be tried early, ideally within weeks.**  
Don’t hesitate to throw away the clumsy parts and rebuild them.


4. **Use tools in preference to unskilled help to lighten a programming task**,  
   even if you have to detour to build the tools and expect to throw some of them out after you’ve finished using them.

<p>&nbsp;</p>

[@isaacs](https://www.npmjs.com/~isaacs) follows this up with a thoughtful translation into [nodejs](https://nodejs.org) terms. His [whole post](https://blog.izs.me/2013/04/unix-philosophy-and-nodejs) is worth the read, but here's a distillation:

- **Working** is better than perfect.
- **Focus** is better than features.
- **Compatibility** is better than purity.
- **Simplicity** is better than anything.


<p>&nbsp;</p>
<p>&nbsp;</p>


# Development Setup

### Extracting Secrets

When setting up a new developer (or your next machine). Extract all your "secret key" configuration files (eg. the `.env` and other `.gitignore`-ed configuration files that must never be commited) by running the [msync](https://github.com/philcockfield/msync) command:


      msync hidden


...this will produce a folder that you can use to easily copy into your new working folder.  

**This temporarily generated folder must never be commited into the repo.**  Once you have your temporary folder assembled, transmit it to the next developer (or yourself on your next development machine) after appropriately editing out any API keys/tokens that are personally assigned to you. Send this over some sensibly secure "password/secret" transmission channel.


<p>&nbsp;</p>
<p>&nbsp;</p>


# License
It's [MIT](LICENSE) all the way!  

Plus...for a scintillating break down of this open-source classic, treat yourself to **Kyle E. Mitchell's**  
"[The MIT License line-by-line.](https://writing.kemitchell.com/2016/09/21/MIT-License-Line-by-Line.html) 171 words every programmer should understand."

<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fuiharness%2Fplatform?ref=badge_large" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fuiharness%2Fplatform.svg?type=large"/></a>

<p>&nbsp;</p>
<p>&nbsp;</p>



## Be Forewarned
![pre-release](https://img.shields.io/badge/Status-pre--release-orange.svg)  
API's and other structures will change (probably radically 🐷) prior to `1.x` release.


<p>&nbsp;</p>
<p>&nbsp;</p>



## TODO ( WIP )

- [ ] [npm deprecations](https://docs.npmjs.com/cli/v7/commands/npm-deprecate) on archived (obsolete/cleaned out) published code modules.