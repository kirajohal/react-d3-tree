import React, { PropTypes } from 'react';
import uuid from 'uuid';
import { select } from 'd3';

import './style.css';

export default class Node extends React.Component {

  constructor(props) {
    super(props);
    const { parent } = props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    this.state = {
      transform: this.setTransformOrientation(originX, originY),
      initialStyle: {
        opacity: 0,
      },
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { x, y } = this.props.nodeData;
    const transform = this.setTransformOrientation(x, y);

    this.applyTransform(transform);
  }

  componentWillUpdate(nextProps) {
    const transform = this.setTransformOrientation(nextProps.nodeData.x, nextProps.nodeData.y);
    this.applyTransform(transform);
  }

  setTransformOrientation(x, y) {
    return this.props.orientation === 'horizontal' ?
      `translate(${y},${x})` :
      `translate(${x},${y})`;
  }

  applyTransform(transform, opacity = 1, done = () => {}) {
    const { transitionDuration } = this.props;

    select(this.node)
    .transition()
    .duration(transitionDuration)
    .attr('transform', transform)
    .style('opacity', opacity)
    .each('end', done);
  }

  handleClick() {
    this.props.onClick(this.props.nodeData.id);
  }

  componentWillLeave(done) {
    const { parent } = this.props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;
    const transform = this.setTransformOrientation(originX, originY);

    this.applyTransform(transform, 0, done);
  }

  render() {
    const { nodeData } = this.props;

    return (
      <g
        id={nodeData.id}
        ref={(n) => { this.node = n; }}
        style={this.state.initialStyle}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={this.state.transform}
        onClick={this.handleClick}
      >
        <text
          className="primaryLabelBase"
          textAnchor={this.props.textAnchor}
          style={this.props.primaryLabelStyle}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.primaryLabel}
        </text>

        <circle
          r={this.props.circleRadius}
          style={nodeData._children ? this.props.circleStyle : this.props.leafCircleStyle}
        />

        <text
          className="secondaryLabelsBase"
          y="0"
          textAnchor={this.props.textAnchor}
          style={this.props.secondaryLabelsStyle}
        >
          {this.props.secondaryLabels && Object.keys(this.props.secondaryLabels).map((labelKey) =>
            <tspan x="10" dy="1.2em" key={uuid.v4()}>
              {labelKey}: {this.props.secondaryLabels[labelKey]}
            </tspan>
          )}
        </text>
      </g>
    );
  }
}

Node.defaultProps = {
  depthFactor: undefined,
  circleRadius: 10,
  circleStyle: {
    stroke: '#000',
    strokeWidth: 2,
    fill: 'grey',
  },
  leafCircleStyle: {
    stroke: '#000',
    strokeWidth: 2,
    fill: 'transparent',
  },
};

/* eslint-disable */
Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  depthFactor: PropTypes.number,
  primaryLabel: PropTypes.string,
  primaryLabelStyle: PropTypes.object,
  secondaryLabels: PropTypes.object,
  secondaryLabelsStyle: PropTypes.object,
  textAnchor: PropTypes.string,
  circleRadius: PropTypes.number,
  circleStyle: PropTypes.object,
  leafCircleStyle: PropTypes.object,
};
/* eslint-enable */