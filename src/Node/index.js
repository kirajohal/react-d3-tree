import React from 'react';
import PropTypes from 'prop-types';
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
    console.log(this.props);
    if (this.props.nodeSize) {
      x -= this.props.nodeSize.x / 4;
      // y -= this.props.nodeSize.y / 4;
    }
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
    const { nodeData, NodeAlternativeComponent, styles } = this.props;
    const nodeStyle = nodeData._children ? { ...styles.node } : { ...styles.leafNode };

    const defaultView = (
      <g
        id={nodeData.id}
        ref={(n) => { this.node = n; }}
        style={this.state.initialStyle}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={this.state.transform}
        onClick={this.handleClick}
      >
        <text
          className="nodeNameBase"
          textAnchor={this.props.textAnchor}
          style={nodeStyle.name}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.name}
        </text>

        <circle
          r={this.props.circleRadius}
          style={nodeStyle.circle}
        />

        <text
          className="nodeAttributesBase"
          y="0"
          textAnchor={this.props.textAnchor}
          style={nodeStyle.attributes}
        >
          {
            this.props.attributes &&
            Object.keys(this.props.attributes).map((labelKey) =>
              <tspan x="10" dy="1.2em" key={uuid.v4()}>
                {labelKey}: {this.props.attributes[labelKey]}
              </tspan>
            )
          }
        </text>
      </g>);

    if (NodeAlternativeComponent) {
      console.log(nodeData);
      return (
        <g
          id={nodeData.id}
          ref={(n) => { this.node = n; }}
          style={this.state.initialStyle}
          className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
          transform={this.state.transform}
          onClick={this.handleClick}
        >
          {NodeAlternativeComponent(nodeData)}
        </g>);
    }
    return (defaultView);
  }
}

Node.defaultProps = {
  NodeAlternativeComponent: undefined,
  textAnchor: 'start',
  attributes: undefined,
  styles: {
    node: {
      circle: {},
      name: {},
      attributes: {},
    },
    leafNode: {
      circle: {},
      name: {},
      attributes: {},
    },
  },
  nodeSize: undefined,
};

Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  NodeAlternativeComponent: PropTypes.func,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  textAnchor: PropTypes.string,
  circleRadius: PropTypes.number.isRequired,
  styles: PropTypes.object,
  nodeSize: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};
