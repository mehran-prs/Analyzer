$(function () {
    let resp;

    let backgrounds = ['rgba(255, 79, 23, 1)',
                       'rgba(51,181,255,1)',
                       'rgba(254,6,83, 1)',
                       'rgba(0, 210, 104, 1)',
                       'rgba(93, 109, 126, 1)',
                       'rgba(126, 41, 193,1)'];

    let $hidden = $('.a-hidden');
    let $overallContainer = $('.all-overalls');
    let $tablesC = $('.tables-c');
    let $chartsC = $('.charts-c');
    let $sidebar = $('.sidebar');

    function initSmoothScroll() {
        $(document).on('click', 'a[href^="#"]', function (event) {
            event.preventDefault();

            $('html, body').animate({
                scrollTop: $($.attr(this, 'href')).offset().top
            }, 500);
        });
    }

    let h = {
        randBg() {
            return backgrounds[Math.floor(Math.random() * backgrounds.length)];
        },
        setCookie: function (name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        },
        getCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
    };

    let tbMaker = {
        head: function (headers) {
            let headersDom = '';
            for (let i in headers) {
                if (headers.hasOwnProperty(i))
                    headersDom += '<th>' + headers[i] + '</th>';
            }

            return '<thead><tr>' + headersDom + '</tr></thead>';
        },
        row : function (fields, filterFields) {
            let headers = '';
            for (let i in fields) {
                if (fields.hasOwnProperty(i) && filterFields.indexOf(i) === -1)
                    headers += '<th>' + fields[i] + '</th>';
            }

            return '<tr>' + headers + '</tr>';
        },
        body: function (records, filterFields) {
            let recordsDom = '';

            for (let i in records) {
                if (records.hasOwnProperty(i))
                    recordsDom += this.row(records[i], filterFields);
            }

            return '<tbody>' + recordsDom + '</tbody>';
        },
        make: function (thead, tbody, tfooter) {
            return '<table class="table table-striped table-bordered table-responsive">' + thead + tbody + tfooter + '</table>';
        }
    };

    let tbHelper = {
        setExtraData: function ($table, key, val, tbName) {
            let $extra = $table.find('.extra');

            // If not provided value, we get from overalls.
            if (!val && key) {
                $extra.find('.t-name').text("Total " + resp.overall[key].name + " :");
                $extra.find('.t-val').text(resp.overall[key].val);
            } else if (key) {
                $extra.find('.t-name').text(key);
                $extra.find('.t-val').text(val);
            } else {
                $extra.find('.t-name').text('');
                $extra.find('.t-val').text('');
            }

            // Set Table Name:
            let $tbName = $extra.find('.tb-name');

            if (tbName) {
                $tbName.text(tbName);
            }
            else {
                $tbName.parent().remove();
                $extra.find('.col-sm-6').toggleClass('col-sm-6 col-sm-12');
            }

        },
        cloneTable  : function (yField, id, tbName, removeChart) {
            id = id ? id : yField + Math.floor(Math.random() * 999999);

            tbName = tbName ? tbName : (resp.overall[yField] ? resp.overall[yField].name : yField);

            let $table = $hidden.find('.a-table').clone(true);

            if (removeChart)
                $table.find('.chart').remove();

            $table.attr('id', id);

            removeChart ? $tablesC.append($table) : $chartsC.append($table);

            Sidebar.addItem(id, tbName);

            this.setExtraData($table, yField, null, tbName);

            return $table;
        },
        tbFields    : function (table, asArray) {

            let fields = table[Object.keys(table)[0]];
            if (asArray) {
                let arr = [];
                for (let i in fields)
                    if (fields.hasOwnProperty(i))
                        arr.push(i);

                return arr;
            }

            return fields;

        },
    };

    let RespFormatter = {
        extractIps: function () {
            let ips = {};

            for (let ccode in resp.tb) {
                if (!resp.tb.hasOwnProperty(ccode))
                    continue;

                let IPRecords = resp.tb[ccode]['ips'];

                // Set name field:
                for (let ip in IPRecords) {
                    if (!IPRecords.hasOwnProperty(ip))
                        continue;

                    // Set ports:
                    let ports = {};

                    for (let port in IPRecords[ip]['ports'])
                        ports['Port: ' + port] = IPRecords[ip]['ports'][port];

                    // You can set real name of ip(but should requesting for all ips from dns.)
                    IPRecords[ip] = $.extend({name: ip}, IPRecords[ip], ports);
                }

                $.extend(ips, IPRecords);
            }

            resp.ips = ips;
        },
        reformat  : function () {
            this.extractIps();
        }
    };

    let Overall = {
        addOverall: function (name, val) {
            let $dom = $hidden.find('.overall-c').clone(true);

            $dom.find('.overall').css('background-color', h.randBg());
            $dom.find('.name').text(name);
            $dom.find('.val').text(val);

            $overallContainer.append($dom);
        },
        flush     : function () {
            $overallContainer.empty();
        },
        setData   : function () {
            // Set Overall
            for (let i in resp.overall) {
                if (!resp.overall.hasOwnProperty(i))
                    continue;

                let overall = resp.overall[i];
                this.addOverall(overall.name, overall.val);
            }
        },
        refresh   : function () {
            this.flush();
            this.setData();
        }
    };

    let NotFound = {
        refresh: function () {
            let notFound = resp['not-found'];

            // Set Not found dates:
            if (notFound.length) {
                console.log("Not Found sniffered packets in this dates: " + notFound.join(', '));
                $('.wrap').noty({
                    text: "Not Found sniffered packets in this dates: " + notFound.join(', '),
                }).show();
            }
        }
    };

    let Charts = {
        nonNumeric            : ['name', 'ports', 'ips'],
        drawChart             : function ($table, chartData, type) {
            let ctx = $table.find('.chart')[0].getContext('2d');

            if (!type)
                type = h.getCookie('chart_type') ? h.getCookie('chart_type') : 'bar';

            let myChart = new Chart(ctx, {
                type   : type,
                data   : chartData,
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    legend: {
                        display : false,
                        position: 'top',
                        labels  : {
                            fontColor: 'white'
                        }
                    },
                    title : {
                        display  : true,
                        text     : 'Chart.js Radar Chart',
                        fontColor: 'white'
                    },
                }
            });
        },
        reformatTableToChart  : function (table, chartYField) {

            let labels = [];
            let data = [];
            let bg = [];

            for (let i in table) {
                if (!table.hasOwnProperty(i))
                    continue;

                let record = table[i];
                labels.push(record.name);
                data.push(record[chartYField]);
                bg.push(h.randBg());
            }

            return {
                labels  : labels,
                datasets: [{
                    label          : chartYField,
                    data           : data,
                    backgroundColor: bg,
                    borderColor    : bg,
                    borderWidth    : 1
                }]
            };
        },
        flush                 : function () {
            $chartsC.empty();
        },
        drawBaseCharts        : function (table, fields) {
            // Get First Record
            fields = fields ? fields : tbHelper.tbFields(table, true);

            for (let i in fields) {
                if (!fields.hasOwnProperty(i))
                    continue;

                let field = fields[i];

                // Don't want to draw chart for non numeric fields.
                if (this.nonNumeric.indexOf(field) !== -1)
                    continue;

                let $table = tbHelper.cloneTable(field);

                this.drawChart($table, this.reformatTableToChart(table, field));
            }
        },
        drawBaseCircularCharts: function (table, $yFields) {

            for (let i in $yFields) {
                if (!$yFields.hasOwnProperty(i))
                    continue;

                let field = $yFields[i];

                let $table = tbHelper.cloneTable(field);

                this.drawChart($table, this.reformatTableToChart(table, field), 'pie');
            }
        },

        refresh      : function () {
            this.flush();

            // Draw ips charts:
            Sidebar.addHeader('Pie IP Charts');
            this.drawBaseCircularCharts(resp.ips, ['hits', 'len']);
            Sidebar.addHeader('Bar IP Charts');
            this.drawBaseCharts(resp.ips, ['hits', 'len']);

            // Draw countries charts:
            Sidebar.addHeader('Pie Country Charts');
            this.drawBaseCircularCharts(resp.tb, ['hits', 'len']);
            Sidebar.addHeader('Bar Country Charts');
            this.drawBaseCharts(resp.tb);
        },
        initChartType: function () {
            let type = h.getCookie('chart_type') ? h.getCookie('chart_type') : 'bar';

            // Set current active charts type.
            $('.chart-type[data-type="' + type + '"]').addClass('active');

            let $types = $('.chart-type');

            $types.on('click', function () {
                let type = $(this).attr('data-type');

                h.setCookie('chart_type', type, 365);

                $types.removeClass('active');

                $(this).addClass('active');

                // Refresh
                setResp();
            });
        },
        init         : function () {
            this.initChartType();
        },
    };

    let Tables = {
        filterFields    : ['ports'],
        drawTable       : function ($table, table) {
            let $tbContainer = $table.find('.tb-c');
            let fields = tbHelper.tbFields(table);

            let headers = [];
            for (let i in fields) {
                if (fields.hasOwnProperty(i) && this.filterFields.indexOf(i) === -1)
                    headers.push(i);
            }

            let tableDom = tbMaker.make(tbMaker.head(headers), tbMaker.body(table, this.filterFields), '');

            $tbContainer.html(tableDom);
        },
        flush           : function () {
            $tablesC.empty();
        },
        addTotalIPsTable: function () {
            let $table = tbHelper.cloneTable(null, 'total_ips_tb', 'Most Used IP Table', true);

            this.drawTable($table, resp.ips)
        },
        refresh         : function () {
            this.flush();
            Sidebar.addHeader('IP Tables');
            this.addTotalIPsTable();
        }
    };

    let Sidebar = {
        addHeader: function (name) {
            let $item = $('<a class="header-item">' + name + '</a>');

            $sidebar.find('.list').append($item);
        },
        addItem  : function (identifier, tbName) {
            let $item = $('<a class="item">' + tbName + '</a>');
            $item.attr('href', '#' + identifier);

            $sidebar.find('.list').append($item);
        },
        refresh  : function () {
            $sidebar.find('.list').empty();
        }
    };

    let DataGetter = {
        err : function (err) {
            for (let i in err) {
                if (err.hasOwnProperty(i))
                    alert(err[i])
            }
        },
        get : function () {
            self = this;
            let from = $('[name="from"]').val();
            let to = $('[name="to"]').val();

            // Request log:
            $.ajax({
                url        : '/data',
                data       : {
                    from: from,
                    to  : to,
                },
                success    : function (response) {
                    if (!response.success)
                        self.err(response.errors);
                    else {
                        resp = response;
                        setResp(response);
                    }
                },
                requestType: 'json',
            });
        },
        init: function () {
            let self = this;

            $('.analyze-btn').on('click', function () {
                self.get();
            });

            // Get for first time:
            this.get();
        }
    };

    function setResp() {

        RespFormatter.reformat();

        console.log(resp);

        Sidebar.refresh();
        Overall.refresh();
        NotFound.refresh();
        Tables.refresh();
        Charts.refresh();

    };


    // Initialize smot scorll to tables:
    initSmoothScroll();
    Charts.initChartType();
    DataGetter.init();
});