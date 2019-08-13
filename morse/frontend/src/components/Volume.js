import React, { Component } from "react";
import { connect } from "react-redux";
import { changeGain } from "../actions/morseActions";
class Volume extends Component {
  onChange = e => {
    this.props.changeGain(e.target.value);
  };
  render() {
    return (
      <div>
        <div>
          <label> volume: {(this.props.morse.volume * 100).toFixed(0)} %</label>
        </div>
        <input
          onChange={this.onChange}
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={this.props.morse.volume}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  morse: state.morseReducers
});

export default connect(
  mapStateToProps,
  { changeGain }
)(Volume);
