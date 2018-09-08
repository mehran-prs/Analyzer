<div class="form-inline text-center">
    <div class="input-group m-a-10">
        <span class="input-group-addon">From</span>
        <input type="date" name="from" value="{{ now()->addDays(-10)->format('Y-m-d') }}" title="from" class="form-control">
    </div>

    <div class="input-group m-a-10">
        <span class="input-group-addon">to</span>
        <input type="date" value="{{ now()->format('Y-m-d') }}" name="to" title="to" class="form-control">
    </div>

    <button class="btn btn-primary m-a-10 analyze-btn">Analyze</button>
</div>
