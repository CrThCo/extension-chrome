function DecodeJWTToken(token) {
  try{
    return JSON.parse(atob(token.split('.')[1]))
  }catch(err) {
    console.log(err)
  }
  return undefined
}
function unixDate(unixtime) {
  return new Date(unixtime * 1000);
}


function GetUserDetail() {
  chrome.storage.sync.get(['authtoken', 'API'], function(r){
    var d =  DecodeJWTToken(r.authtoken)
    if (d.sub !== undefined ) {
      $.ajax({
        url: `${r.API}user/${d.sub}`,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
        },
        success: function(res) {
          console.log(res)
          var p = `
            <p><span class="d-block lheaidng">Connected Account:</span> ${res.first_name} ${res.last_name} @${res.username}</p>
            <p><button id="unlinkAccount" class="link ls-1 t-up">Unlink your account!</button></p>
          `
          $('#profile').html(p)
          $('#profile').show()
          $('#singin-form').hide()
        },
        error: function(err) {
          $('#profile').hide()
          $('#singin-form').show()
        }
      })
    }
  })
}

function refreshAuthToken() {
  chrome.storage.sync.get(['authtoken', 'API'], function(r){
    if (r.authtoken.length > 0) {
      $.ajax({
        url: `${r.API}user/token/refresh`,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
        },
        success: function (res) {
          chrome.storage.sync.set({'authtoken': res.token}, function() {})
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
    if($('.ProfileCanopy--withNav').length > 0) {
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
          width: ee.width-3,
          left: ee.left+3,
          top: ee.top
        }
      }, function (response) {

        showModel(target, {
          height: ee.height -1,
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

$("body").on('submit', '#cf-vote-form', function(e){
  e.preventDefault();
  try{
    var self = $(this)
    $('#options-table').hide()
    $('#action-btn').hide()
    $('#action-text').show()
    $('#action-text').html(`<span class="cf-loading">Please wait...</span>`)
    chrome.storage.sync.get(['authtoken', 'API'], function(r){
      const img = $('.captued_content #image').get(0).toDataURL('image/jpeg')
      $.ajax({
        url: `${r.API}post/save`,
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${r.authtoken}`)
        },
        data:   JSON.stringify({
          options: self.serializeArray(),
          content: '',
          image: img.replace('data:image/jpeg;base64,','')
        }),
        success: function (res) {
          $('#action-text').html(`<span class="cf-success">Saved successfully!</span>`)
          setTimeout(function(){
            $('div.connect-model-overlay').remove()     
          }, 5000)
        }, error: function(err) {
          $('#action-text').html(`<span class="cf-error">Error occured!</span>`)
          setTimeout(function(){
            $('#options-table').show()
            $('#action-text').html(``)
            $('#action-text').hide()
            $('#action-btn').show()        
          }, 5000)
        }
      })
    })
  } catch(err){
    $('#action-text').html(`<span class="cf-error">Error occured! Please reload page and try again!</span>`)
      setTimeout(function(){
        $('#options-table').show()
        $('#action-text').html(``)
        $('#action-text').hide()
        $('#action-btn').show()        
      }, 5000)
  }
})


function showModel(target, meta) {
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