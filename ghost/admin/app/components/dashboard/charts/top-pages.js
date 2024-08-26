'use client';

import Component from '@glimmer/component';
import React from 'react';
import config from 'ghost-admin/config/environment';
import moment from 'moment-timezone';
import {BarList} from '@tinybirdco/charts';

export default class TopPages extends Component {
    ReactComponent = (props) => {
        let chartDays = props.chartDays;

        const endDate = moment().endOf('day');
        const startDate = moment().subtract(chartDays - 1, 'days').startOf('day');

        /**
         * @typedef {Object} Params
         * @property {string} cid
         * @property {string} [date_from]
         * @property {string} [date_to]
         * @property {number} [limit]
         * @property {number} [skip]
         */
        const params = {
            cid: config.tinybirdCid,
            date_from: startDate.format('YYYY-MM-DD'),
            date_to: endDate.format('YYYY-MM-DD')
        };

        return (
            <BarList
                endpoint={'https://api.tinybird.co/v0/pipes/top_pages.json'}
                token={config.tinybirdToken}
                index="pathname"
                categories={['visits', 'hits', 'logged_in_hits', 'logged_out_hits']}
                colorPalette={['#B78AFB', '#7FDE8A', '#FBCE75', '#F97DB7', '#6ED0FB']}
                height="280px"
                params={params}
            />
        );
    };
}
