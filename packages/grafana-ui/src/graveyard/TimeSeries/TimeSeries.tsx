import { Component } from 'react';
import * as React from 'react';

import { DataFrame, TimeRange } from '@grafana/data';
import { LegendDisplayMode } from '@grafana/schema';

import { PanelContextRoot } from '../../components/PanelChrome/PanelContext';
import { hasVisibleLegendSeries, PlotLegend } from '../../components/uPlot/PlotLegend';
import { UPlotConfigBuilder } from '../../components/uPlot/config/UPlotConfigBuilder';
import { withTheme2 } from '../../themes/ThemeContext';
import { GraphNG, GraphNGProps, PropDiffFn } from '../GraphNG/GraphNG';

import { preparePlotConfigBuilder } from './utils';

const propsToDiff: Array<string | PropDiffFn> = ['legend', 'options', 'theme'];

type TimeSeriesProps = Omit<GraphNGProps, 'prepConfig' | 'propsToDiff' | 'renderLegend'>;

class UnthemedTimeSeries extends Component<TimeSeriesProps> {
  static contextType = PanelContextRoot;
  declare context: React.ContextType<typeof PanelContextRoot>;

  prepConfig = (alignedFrame: DataFrame, allFrames: DataFrame[], getTimeRange: () => TimeRange) => {
    const { sync } = this.context;
    const { theme, timeZone, renderers, tweakAxis, tweakScale } = this.props;

    return preparePlotConfigBuilder({
      frame: alignedFrame,
      theme,
      timeZones: Array.isArray(timeZone) ? timeZone : [timeZone],
      getTimeRange,
      sync,
      allFrames,
      renderers,
      tweakScale,
      tweakAxis,
    });
  };

  renderLegend = (config: UPlotConfigBuilder) => {
    const { legend, frames } = this.props;

    // A hidden legend must not render a legend container: it measures 0 height, which VizLayout treats as
    // "not measured yet", so the chart would never render.
    const legendHidden = !legend?.showLegend || legend?.displayMode === LegendDisplayMode.Hidden;
    if (!config || (legend && legendHidden) || !hasVisibleLegendSeries(config, frames)) {
      return null;
    }

    return <PlotLegend data={frames} config={config} {...legend} />;
  };

  render() {
    return (
      <GraphNG
        {...this.props}
        prepConfig={this.prepConfig}
        propsToDiff={propsToDiff}
        renderLegend={this.renderLegend}
      />
    );
  }
}

export const TimeSeries = withTheme2(UnthemedTimeSeries);
TimeSeries.displayName = 'TimeSeries';
