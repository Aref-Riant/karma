import { Component } from "react";
import PropTypes from "prop-types";

import { AlertStore } from "Stores/AlertStore";
import {
  StaticColorLabelClassMap,
  DefaultLabelClassMap,
  AlertNameLabelClassMap,
  StateLabelClassMap
} from "Common/Colors";
import { QueryOperators, FormatQuery, StaticLabels } from "Common/Query";

const isBackgroundDark = brightness => brightness <= 125;

// base class for shared code, not used directly
class BaseLabel extends Component {
  static propTypes = {
    alertStore: PropTypes.instanceOf(AlertStore).isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  };

  getClassAndStyle(name, value, extraClass, baseClass) {
    const { alertStore } = this.props;

    const elementType = baseClass || "badge";

    const data = {
      style: {},
      className: "",
      baseClassNames: ["components-label", elementType],
      colorClassNames: []
    };

    if (name === StaticLabels.AlertName) {
      data.colorClassNames.push(AlertNameLabelClassMap[elementType]);
    } else if (name === StaticLabels.State) {
      data.colorClassNames.push(
        StateLabelClassMap[value]
          ? `${elementType}-${StateLabelClassMap[value]}`
          : DefaultLabelClassMap[elementType]
      );
    } else if (alertStore.settings.values.staticColorLabels.includes(name)) {
      data.colorClassNames.push(StaticColorLabelClassMap[elementType]);
    } else {
      const c = alertStore.data.getColorData(name, value);
      if (c) {
        // if there's color information use it
        data.style["backgroundColor"] = `rgba(${[
          c.background.red,
          c.background.green,
          c.background.blue,
          c.background.alpha
        ].join(", ")})`;

        data.colorClassNames.push(
          isBackgroundDark(c.brightness)
            ? "components-label-dark"
            : "components-label-bright"
        );

        data.colorClassNames.push(
          `components-label-brightness-${Math.round(c.brightness / 25)}`
        );
      } else {
        // if not fall back to class
        data.colorClassNames.push(DefaultLabelClassMap[elementType]);
      }
    }
    data.className = `${[...data.baseClassNames, ...data.colorClassNames].join(
      " "
    )} ${extraClass || ""}`;

    return data;
  }

  handleClick = event => {
    // left click       => apply foo=bar filter
    // left click + alt => apply foo!=bar filter
    const operator =
      event.altKey === true ? QueryOperators.NotEqual : QueryOperators.Equal;

    event.preventDefault();

    const { name, value, alertStore } = this.props;
    alertStore.filters.addFilter(FormatQuery(name, operator, value));
  };
}

export { BaseLabel };
