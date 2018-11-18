function DecodeJWTToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (err) {
    console.log(err)
  }
  return undefined
}

function unixDate(unixtime) {
  return new Date(unixtime * 1000);
}

const provider = mmprovider()

provider.on('error', function(err) {
  console.log('MM Error ', err)
})

var web3Instance = null

function GetWeb3() {
  if (web3Instance === null) {
    if (provider) {
      web3 = new Web3(provider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }
    try {
      web3.eth.defaultAccount = web3.eth.accounts[0];
      web3Instance = web3
    } catch (err) {
      console.log(err)
    }
  }
  return web3
}



function GetContract() {
  const web3 = GetWeb3()
  const contract = web3.eth.contract([{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getDocument","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"},{"name":"timestamp","type":"uint256"},{"name":"username","type":"string"}],"name":"newDoc","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"username","type":"string"},{"indexed":true,"name":"hash","type":"bytes32"}],"name":"DOCSAVE","type":"event"}]);
  return contract.at('0x6f99168c3ACDaADDd55E58fB3A4c0063479D3Bcc');
}

function SignDoc(hash, timestamp, username, cb) {
  try {
    console.log('signing document')
    const instance = GetContract()
    instance.newDoc(hash, timestamp, username, function (err, result) {
      cb(err, result);
    })
  } catch(err){
    console.log(err)
  }
}


function GetUserDetail() {
  setTimeout(function () {
    
    chrome.storage.sync.get(['authtoken', 'API'], function (r) {
      var d = DecodeJWTToken(r.authtoken)
      if (typeof d != 'undefined' && d.sub !== undefined) {
        $.ajax({
          url: `${r.API}user/i/${d.sub}`,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
          },
          success: function (res) {
            $('#error').html("")
            var p = `
              <p><span class="d-block lheaidng">Connected Account:</span> ${res.first_name} ${res.last_name} @${res.username}</p>
              <p><button id="unlinkAccount" class="link ls-1 t-up">Unlink your account!</button></p>
            `
            $('#profile').html(p)
            $('#profile').show()
            $('#singin-form').hide()
          },
          error: function (err) {
            $('#profile').hide()
            $('#error').html("<div class='alert alert-error'>Error occured while fetching user information!</div>")
            $('#singin-form').show()
          }
        })
      }
    })
  }, 500);
}

function refreshAuthToken() {
  chrome.storage.sync.get(['authtoken', 'API'], function (r) {
    if (r.authtoken.length > 0) {
      $.ajax({
        url: `${r.API}user/token/refresh`,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
        },
        success: function (res) {
          chrome.storage.sync.set({
            'authtoken': res.token
          }, function () {})
        },
        error: function (err) {
          console.log(err)
        }
      })
    }

  })
}


function connectElement(id) {
  var c = 'data:image/png;base64,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'
  const imgElement = document.createElement('img')
  imgElement.setAttribute('src', c)
  imgElement.width = 18

  const element = document.createElement('div')
  element.setAttribute('class', 'ProfileTweet-action signed_with_connect_wpr signed_with_connect')
  element.setAttribute('title', 'sing post with connect!')
  element.setAttribute('data-target', id)
  element.appendChild(imgElement)
  element.addEventListener('click', function (event) {
    event.stopPropagation()
    event.preventDefault()
    const self = $(this)
    self.hide()
    const target = self.attr('data-target')

    let offset = 50
    if ($('.ProfileCanopy--withNav').length > 0) {
      offset = 135
    }
    const t = $(`[data-item-id="${target}"]`)
    $('html, body').animate({
      scrollTop: t.offset().top - offset
    });

    const tweet = t.find('div.tweet')
    let tweet_metadata = null
    let tweet_timestamp = null
    if (tweet.length > 0) {
      tweet_metadata = tweet.get(0).dataset
      tweet_timestamp = tweet.find('.stream-item-header')
        .find('.time')
        .find('a.tweet-timestamp')
        .find('span._timestamp')
        .get(0)
        .dataset
    }
    // Extracting twitter handle
    const tweetBy = tweet.find('div.content')
      .find('div.stream-item-header')
      .find('a.account-group')
      .find('span.username')
      .text()


    const signedBy = $('.DashUserDropdown')
      .find('ul')
      .find('li.DashUserDropdown-userInfo')
      .find('a')
      .find('p.name')
      .find('span.username')
      .text()

    setTimeout(function () {
      const ee = t.get(0).getBoundingClientRect()     

      chrome.runtime.sendMessage({
        action: "capture",
        target: target,
        meta: {
          height: ee.height,
          width: ee.width - 3,
          left: ee.left + 3,
          top: ee.top
        }
      }, function (response) {

        showModel(target, {
          height: ee.height - 1,
          width: ee.width - 5,
          tweetBy: tweetBy,
          signedBy: signedBy,
          ...tweet_metadata,
          ...tweet_timestamp
        })
        self.show()
      });
    }, 500)
    return false
  })

  return element
}

$("body").on('submit', '#cf-vote-form', function (e) {
  e.preventDefault();

  

  try {
    var self = $(this)
    $('#options-table').hide()
    $('#action-btn').hide()
    $('#action-text').show()
    $('#action-text').html(`<span class="cf-loading">Please wait...</span>`)
    const img = $('.captued_content #image').get(0).toDataURL('image/jpeg')
    const captured_image = img.replace('data:image/jpeg;base64,', '')
    const hash = md5(captured_image)
    const now = new Date().getTime()

    SignDoc(hash, now, "test001", function(err, success) {
      if (err) 
        console.log(err)
      else 
        console.log(success)
    })

    chrome.storage.sync.get(['authtoken', 'API'], function (r) {
      $.ajax({
        url: `${r.API}post/save`,
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
        },
        data: JSON.stringify({
          options: self.serializeArray(),
          content: '',
          image: captured_image,
          hash: hash
        }),
        success: function (res) {
          $('#action-text').html(`<span class="cf-success">Saved successfully!</span>`)
          setTimeout(function () {
            $('div.connect-model-overlay').remove()
          }, 5000)
        },
        error: function (err) {          
          $('#action-text').html(`<span class="cf-error">Error occured!</span>`)
          setTimeout(function () {
            $('#options-table').show()
            $('#action-text').html(``)
            $('#action-text').hide()
            $('#action-btn').show()
          }, 5000)
        }
      })
    })
  } catch (err) {
    console.log(err)
    $('#action-text').html(`<span class="cf-error">Error occured! Please reload page and try again!</span>`)
    setTimeout(function () {
      $('#options-table').show()
      $('#action-text').html(``)
      $('#action-text').hide()
      $('#action-btn').show()
    }, 5000)
  }
})


function showModel(target, meta) {
  const inst = GetWeb3()
  const t = `connect_${target}`
  const modelHtml = `
    <div class="connect-model-overlay">
      <div class="connect-modal-close" title="close">
        <span class="Icon Icon--close"></span>
      </div>
      <div class="connect-modal">
        <div class="connect-content">
          <h4>Signed at: ${new Date()}</h4>
          <h5>Tweet by:${meta.tweetBy}, Signed by:${meta.signedBy}</h5>
          <div class="captued_content">
            <canvas id="image" width="${meta.width}" height="${meta.height}" ></canvas>
          </div>
          <div id='${t}'>
            <div class="PermalinkOverlay-spinnerContainer">
              <div class="PermalinkOverlay-spinner"></div>
            </div>
          </div>
          <hr />
          <form class="cf-form" id="cf-vote-form">
            <table class="cf-table" id="options-table">
              <tbody>                
                <tr>
                  <td colspan="2">
                    <h3 class="cf-title">Logical Fallacies</h3>                    
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="ad-hominem" id="lf-ah" />
                    <label for="lf-ah" title="This translates as “to the man” and refers to any attacks on the person advancing the argument, rather than on the validity of the evidence or logic.">Ad Hominem</label>
                  </td>
                  <td>
                    <input type="checkbox" name="affirming-the-consequent" id="lf-atc" />
                    <label for="lf-atc" title="Reversing or confusing the general category with the specific/sub-category.">Affirming the Consequent</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="argument-from-authority" id="lf-afa" />
                    <label for="lf-afa" title="This is the flip side of the ad hominem; in this case, the argument is advanced because of  those advancing it.">Argument from Authority</label>
                  </td>                 
                  <td>
                    <input type="checkbox" name="bandwagon" id="lf-bwn" />
                    <label for="lf-bwn" title="The basic fallacy of democracy: that popular ideas are necessarily right.">Bandwagon</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="dogmatism" id="lf-dmtm" />
                    <label for="lf-dmtm" title="The unwillingness to even consider the opponent’s argument, based on the usually false assumption that competing theories or perspectives cannot co-exist within single systems.">Dogmatism</label>
                  </td>                                 
                  <td>
                    <input type="checkbox" name="emotional-appeals" id="lf-emaps" />
                    <label for="lf-emaps" title="Any attempt to sway an argument via emotion, rather than the quality of the logic or evidence, can be considered a fallacy.">Emotional Appeals</label>
                  </td> 
                </tr>
                <tr>                                                  
                  <td>
                    <input type="checkbox" name="fallacy-of-exclusion" id="lf-foe" />
                    <label for="lf-foe" title="Related to Hasty Generalization, and refers to focusing attention on one group’s behavior and assuming that behavior is unique to that group; yet, in fact, the behavior is common to many groups.">Fallacy of Exclusion</label>
                  </td>
                  <td>
                    <input type="checkbox" name="faulty-analogy" id="lf-fa" />
                    <label for="lf-fa" title="When the comparison suggests that two thing are more alike than they really are.">Faulty Analogy</label>
                  </td>
                </tr>
                <tr> 
                  <td>
                    <input type="checkbox" name="sample" id="lf-sample" />
                    <label for="lf-sample" title="This normally involves mistaking a small incidence for a larger trend.  Racism is the most obvious example.">Sample</label>
                  </td>
                  <td>
                    <input type="checkbox" name="moral-equivalency" id="lf-me" />
                    <label for="lf-me" title="The implication that two moral issues carry the same weight or are essentially similar.">Moral Equivalancy</label>
                  </td>
                </tr>
                <tr>              
                  <td>
                    <input type="checkbox" name="non-sequitur" id="lf-nsqr" />
                    <label for="lf-nsqr" title="Translates as “it does not follow,” meaning that the conclusion does not follow the premises. A logical gap between the premises or evidence and the conclusion.">Non Sequitur</label>
                  </td>
                  <td>
                    <input type="checkbox" name="red-herring" id="lf-rh" />
                    <label for="lf-rh" title="Changing the subject mid-debate, so that we start arguing about a tangential topic rather than the real or original issue.">Red Herring</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="slippery-slope" id="lf-sslope" />
                    <label for="lf-sslope" title="Arguing from the perspective that one change inevitably will lead to another.">Slippery Slope</label>
                  </td>
                  <td>
                    <input type="checkbox" name="straw-man"  id="lf-sman" />
                    <label for="lf-sman" title="One side of the argument is presented as so extreme that no one will agree with it. Often this is done by referring to the exception, rather than the rule, and inferring that the exception is the rule.">Straw Man</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="weasel-words-glittering-generality" id="lf-wwgg" />
                    <label for="lf-wwgg" title="This is the use of words so broadly defined – such as 'love' or 'freedom' or 'rights' or 'patriotism' etc. etc.  – as to become essentially meaningless.">Weasel Words or Glittering Generality</label>
                  </td>
                  <td>
                    <input type="checkbox" name="failing-occam-razor" id="lf-for" />
                    <label for="lf-for" title="Occam's Razor is the scientific principle that the simplest of any given hypotheses is likely to be the right one.">Failing Occam's Razor</label>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <input type="checkbox" name="argument-from-ignorance-or-non-testable-hypothesis" id="lf-afionth" />
                    <label for="lf-afionth" title=" that which has not been proven false must or is likely to be true; however, the fallacy usually applies to concepts that haven’t yet been adequately tested or are beyond the realm of proof.">Argument from gnorance or Non-testable Hypothesis</label>
                  </td>
                <tr>
                <tr>
                  <td colspan="2">
                    <input type="checkbox" name="begging-the-question-or-circular-argument" id="lf-btqoca" />
                    <label for="lf-btqoca" title="Repeating the claim and never providing support for the premises, or, in other words, repeating the same argument over and over again.">Begging the Question or Circular Argument</label>
                  </td>
                </tr>                
                <tr>
                  <td colspan="2">
                    <input type="checkbox" name="either-black-white-false-dilemma-excluded-middle-fallacy" id="lf-ebwfdemf" />
                    <label for="lf-ebwfdemf" title="Paints an issue as one between two extremes with no possible room for middle ground or nuance or compromise.">Either/Or or Black/White, False Dilemma, or Excluded Middle Fallacy</label>
                  </td>
                </tr>
                <tr>                  
                  <td colspan="2">
                    <input type="checkbox" name="hostly-generalization-misunderstanding-statistics-no-representive" id="lf-hgmsnr" />
                    <label for="lf-hgmsnr" title="">Hasty Generalization, Misunderstanding Statistics, or Non-Representative</label>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <input type="checkbox" name="post-hoc-faulty-causality-correlation-causation" id="lf-phofcocvc" />
                    <label for="lf-phofcocvc" title="Mistakenly claiming that one thing causes another to happen since they happen in sequence.">Post Hoc or Faulty Causality, or Correlation vs. Causation</label>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <input type="checkbox" name="semantics-equivocation" id="lf-sqn" />
                    <label for="lf-sqn" title="Using the inherent ambiguity of language to distract from the actual ideas or issues, or deliberately rephrasing the opposing argument incorrectly, and then addressing that rephrasing">Semantics or Equivocation (also, Splitting Hairs, Playing with Words, or Using Legalisms)</label>
                  </td>
                </tr>                
                <tr>
                  <td colspan="2">
                    <h3 class="cf-title">Cognitive Distortion</h3>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="all-or-nothing-thinking" id="aont" />
                    <label for="aont" title="Seeing in black or white. Imperfection leads to failure. If it’s not perfect, it’s a failure.">All-or-Nothing Thinking</label>
                  </td>
                  <td>
                    <input type="checkbox" name"overgeneralization" id="ogln" />
                    <label for="ogln" title="Seeing a single negative event, such as a romantic rejection or a career reversal, as a never-ending pattern of defeat by using words such as “always” or “never” when you think about it.">Overgeneralization</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="mental-filter" id="cmf" />
                    <label for="cmf" title="Picking out a single negative detail and dwelling on it exclusively.">Mental Filter</label>
                  </td>
                  <td>
                    <input type="checkbox" name="discounting-the-positive" id="cdtp" />
                    <label for="cdtp" title="Rejecting positive experiences by insisting they don't count.">Discounting the Positive</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="jumping-to-conclusions" id="cjtc" />
                    <label for="cjtc" title="Interpreting things negatively when there are no facts to support your conclusion. Negativity breeds unhappiness. Without proper investigation, you jump to conclusions imagining things will go bad">Jumpinh to Conclusions</label>
                  </td>
                  <td>
                    <input type="checkbox" name="magnification" id="cmafn" />
                    <label for="cmafn" title="Exaggerating your problems and shortcomings or minimizing your desirable qualities.">Magnification</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="emotional-reasoning" id="cer" />
                    <label for="cer" title="Assuming that your negative emotions necessarily reflect the way things really are.">Emotional Reasoning</label>
                  </td>
                  <td>
                    <input type="checkbox" name="should-statements" id="cssc" />
                    <label for="cssc" title="Telling yourself that things should be the way you hoped or expected them to be without real evidence to support the claim.">Should Statements</label>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="checkbox" name="labeling" id="clc" />
                    <label for="clc" title="Labeling is an extreme form of all-or-nothing thinking. Like ad hominem, can be used easily with nefarious intent.">Labeling</label>
                  </td>
                  <td>
                    <input type="checkbox" name="personalization-and-blame" id="cpabc" />
                    <label for="cpabc" title="Personalization occurs when you hold yourself personally responsible for an event that isn’t entirely under your control.">Personalization and Blame</label>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              <span id="action-text" class="d-none"></span>                 
              <button type="submit" id="action-btn" class="EdgeButton EdgeButton--small EdgeButton--primary">Submit</button>
            </p>
          </form>
          <pre id="debug></pre>
        </div>
      </div>
    </div>
  `
  $('.connect-model-overlay').remove()
  $('body').append(modelHtml)
}

function connectStyle() {
  return `
    <style>
      .connect-model-overlay{
        background: rgba(0,0,0,0.5);
        bottom: 0;
        left: 0;
        overflow: auto;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1010;
      }
      .connect-modal-close {
        cursor: pointer;
        position: fixed;
        right: 20px;
        top: 8px;
      }
      .connect-modal-close .Icon--close {
        color: #fff;
        font-size: 27px;
        line-height: 1;
      }
      .connect-modal {
        background-color: #fff;
        border-radius: 6px;
        min-height: 250px;
        margin-bottom: 20px;
        position: absolute;
        top: 40px!important;
        left: 50%;
        width: 640px;
        margin-left: -320px;
        transform: translate3d(0,0,0);
        color: #14171a;
        font-size: 14px;
        line-height: 20px;
      }
      .connect-content {
        padding: 15px;
      }
      .signed_with_connect{
        cursor:pointer;
        position:relative;
        top:6px
      }
      .cf-table{
        width: 100%;
      }
      .cf-title {
        padding: 15px 0 5px;
        letter-spacing: 1.6px;
      }
      .cf-form label {
        letter-spacing: 0.7px;
        cursor: pointer;
        position: relative;
        top: -1px;
        font-size: 13px;
      }
      .captued_content {
        max-height: 400px;
        overflow: auto;
        text-align: center
      }

      .cf-actions-btns{
        padding-top: 10px;
      }

      .captued_content::-webkit-scrollbar {
          width: 2px;
      }
      .captued_content::-webkit-scrollbar-track {
          background: #f1f1f1; 
      }      
      .captued_content::-webkit-scrollbar-thumb {
          background: #888; 
      }
      .captued_content::-webkit-scrollbar-thumb:hover {
          background: #555; 
      }

      .cf-error {
        padding: 10px 10px 10px 0;
        display: inline-block;
        font-size: 20px;
        letter-spacing: 2px;
        color: red;
      }

      .cf-success {
        padding: 10px 10px 10px 0;
        display: inline-block;
        font-size: 20px;
        letter-spacing: 2px;
        color: green;
      }

      .cf-loading {
        padding: 10px 10px 10px 0;
        display: inline-block;
        font-size: 20px;
        letter-spacing: 2px;
        color: blue;
      }
      
    </style>
  `
}