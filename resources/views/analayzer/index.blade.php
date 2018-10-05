<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Network traffic analyzer</title>
    <link rel="stylesheet" href="{{ asset('/assets/plugins/bootstrap/css/bootstrap.min.css') }}">
    <link rel="stylesheet/less" href="{{ asset('/assets/css/app.less') }}">
</head>
<body>

@include('analayzer.hidden')

<div class="wrapper">
    {{-- Sidebar --}}
    <div class="sidebar">
        @include('analayzer.sidebar')
    </div>

    <div class="wrap">
        {{-- Header --}}
        <div class="header">
            <h3>Python Packet Sniffer</h3>
        </div>

        <div class="date-c">
            @include('analayzer.date')
        </div>

        {{-- Content --}}
        <div class="content container-fluid">
            @include('analayzer.overall')
            @include('analayzer.tables')
            @include('analayzer.charts')
        </div>
    </div>
</div>

<script type="text/javascript" src="{{ asset('/assets/plugins/jquery/jquery-1.11.1.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/plugins/jquery/jquery-migrate-1.2.1.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/plugins/bootstrap/js/bootstrap.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/plugins/chart/Chart.bundle.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/plugins/less/less.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/plugins/noty/jquery.noty.packaged.js') }}"></script>
<script type="text/javascript" src="{{ asset('/assets/js/app.js') }}"></script>

</body>
</html>