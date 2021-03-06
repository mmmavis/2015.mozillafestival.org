var React = require('react');
var ReactRouter = require('react-router');
var moment = require('moment');
var Form = require('react-formbuilder').Form;
var Jumbotron = require('../../components/jumbotron.jsx');
var EventCardGroup = require('../../components/event-card-group.jsx');

var fields = require('./form/fields');

require('whatwg-fetch');

const DATE_FORMAT = `MMM DD, YYYY`;
const TIME_FORMAT = `h:mma`;
// make sure don't include space in between DATE_FORMAT and TIME_FORMAT
// as moment might have trouble understanding it
const DATE_TIME_FORMAT = `${DATE_FORMAT}@${TIME_FORMAT}`;

let sortByTime = function(a,b) {
  let timeA = moment(`${a.date}@${a.time}`, DATE_TIME_FORMAT);
  let timeB = moment(`${b.date}@${b.time}`, DATE_TIME_FORMAT);

  if (timeA < timeB) { return -1; }
  if (timeA > timeB) { return 1; }
  return 0;
};

var FringeEventForm = React.createClass({
  getInitialState: function() {
    return {
      submitting: false,
      formValues: {}
    };
  },
  handleFormUpdate(evt, name, field, value) {
    let formValues = this.state.formValues;
    formValues[name] = value;
    this.setState({
      formValues,
      // hide notice once user starts typing again
      // this is a quick fix.
      showFormInvalidNotice: false
    });
  },
  handleFormSubmit: function(event) {
    event.preventDefault();

    this.refs.formPartOne.validates(partOneIsValid => {
      this.refs.formPartTwo.validates(partTwoIsValid => {
        if (!partOneIsValid) console.error(`Form Part One does not pass validation!`);
        if (!partTwoIsValid) console.error(`Form Part Two does not pass validation!`);

        if (partOneIsValid && partTwoIsValid) {
          this.setState({
            submitting: true,
            showFormInvalidNotice: false
          }, () => {
            this.submitFringeEvent(this.state.formValues);
          });
        } else {
          this.setState({showFormInvalidNotice: true});
        }
      });
    });
  },
  submitFringeEvent(fringeEvent) {
    fringeEvent.timestamp = moment().format('MMM DD, YYYY hh:mm a');

    let request = new XMLHttpRequest();
    request.open(`POST`, `/add-fringe-event`, true);
    request.setRequestHeader("Content-type", "application/json");

    request.onload = (event) => {
      let resStatus = event.currentTarget.status;

      this.setState({ submitting: false }, () => {
        if (resStatus >= 200 && resStatus < 400) {
          ReactRouter.browserHistory.push({
            pathname: `/fringe/success`
          });
        }
      });
    };

    request.onerror = (err) => {
      console.log(err);
    };

    request.send(JSON.stringify(fringeEvent));
  },
  render: function() {
    let formFields = fields.createFields();

    return <div>
      <h2>Event Info</h2>
      <Form ref="formPartOne"
        fields={formFields.partOne}
        inlineErrors={true}
        onUpdate={this.handleFormUpdate} />
      <h2>Privacy Policy</h2>
      <p>Read more about <a href="https://www.mozilla.org/privacy/" target="_blank">Mozilla's privacy policy</a>.</p>
      <Form ref="formPartTwo"
        fields={formFields.partTwo}
        inlineErrors={true}
        onUpdate={this.handleFormUpdate} />
      <div>
        <button
          ref="submitBtn"
          className="btn btn-primary-outline mr-3 my-5"
          type="submit"
          onClick={this.handleFormSubmit}
          disabled={this.state.submitting ? `disabled` : null}
        >{ this.state.submitting ? 'Submitting...' : 'Submit' }</button>
      </div>
    </div>;
  }
});


var FringePage = React.createClass({
  getInitialState: function() {
    return {
      events: [],
      eventsLoaded: false,
      unableToLoadEvents: false
    };
  },
  componentDidMount: function() {
    this.getFringeEvents();
  },
  handleEventResponse: function(response) {
    return response.json();
  },
  handleEventData: function(data) {
    this.setState({
      events: data.sort(sortByTime),
      eventsLoaded: true,
      unableToLoadEvents: false
    });
  },
  handleEventDataError: function() {
    this.setState({
      eventsLoaded: true,
      unableToLoadEvents: true
    });
  },
  getFringeEvents: function() {
    fetch('/get-fringe-events', {
      method: 'get'
    })
      .then(this.handleEventResponse)
      .then(this.handleEventData)
      .catch(this.handleEventDataError);
  },
  handleScrollToFringeForm(event) {
    event.preventDefault();
    this.refs.fringeForm.scrollIntoView(true);
  },
  renderFringeEvents() {
    var events = false;

    if ( this.state.eventsLoaded ) {
      events = <EventCardGroup events={this.state.events} />;
    } else {
      events = this.state.unableToLoadEvents ? <p>Unable to load events.</p>
        : <p className="loading-message">Loading events</p>;
    }
    return events;
  },
  render: function() {
    return (
      <div className="fringe-events-page">
        <Jumbotron image="/assets/images/hero/fringe.jpg"
          image2x="/assets/images/hero/fringe.jpg">
          <h1>Fringe Events</h1>
        </Jumbotron>
        <div className="white-background">
          <div className="content centered wide">
            <h1>If MozFest wasn’t enough for you&hellip;</h1>
            <p>MozFest is about working in the open and sharing ideas with a global network of people dedicating to protecting the health of the Internet.</p>
            <p>There are innovative events taking place around the world with this same philosophy, and we would love to exchange ideas and celebrate together. If your event demonstrates some of the following characteristics, we’d love to promote it as a MozFest Fringe event, and share some of our resources with you:</p>
            <ul className="text-left">
              <li>Event is co-designed with partners.</li>
              <li>Includes creative, hands-on activities.</li>
              <li>Facilitation promotes collaboration, innovation and respect.</li>
              <li>Designed in the open (e.g. you publish process blogs or have an open curation process).</li>
              <li>Presents leadership opportunities for all (attendees, mentors, event staff).</li>
              <li>Protects or advances the health of the Internet.</li>
              <li>Includes a code of conduct, ensuring all are welcome to share and be heard.</li>
            </ul>
            <div className="cta">
              <p>Add your event to the MozFest Fringe calendar.</p>
              <a className="btn btn-primary-outline" href="/fringe/#fringe-form-section" onClick={(event) => this.handleScrollToFringeForm(event)}><span>Add event</span></a>
            </div>
          </div>
        </div>
        <div className="events white-background">
          <div className="content wide">
            { this.renderFringeEvents() }
          </div>
        </div>
        <div className="white-background" id="fringe-form-section" ref="fringeForm">
          <div className="content wide">
            <div className="horizontal-rule"></div>
            <h1 className="text-center">Submit Your Fringe Event</h1>
            <FringeEventForm />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FringePage;
