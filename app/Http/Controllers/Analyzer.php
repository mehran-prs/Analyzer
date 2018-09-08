<?php

namespace App\Http\Controllers;

use App\Http\Filler\Country;
use App\Http\Filler\IP;
use App\Http\Filler\Port;
use App\Http\Overall;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use WhichBrowser\Parser;

class Analyzer extends Controller
{
    protected $conf;

    /**
     * Array contain dates that not found.
     *
     * @var array
     */
    protected $notFoundDates = [];

    /**
     * @var Overall $overall
     */
    protected $overall;

    /** @var Country $countryAnalyzer */
    protected $countryAnalyzer;


    public function __construct()
    {
        $this->conf = config('sniffer');

        $this->countryAnalyzer = new Country($this->conf['non_numeric']);

        $this->overall = new Overall($this->conf['non_numeric']);
    }

    public function data(Request $request)
    {
        $v = Validator::make($request->all(), [
            'from' => 'bail|required|before:to|after:' . now()
                    ->addDay(-1 * $this->conf['days_limit'])
                    ->format('Y-m-d'),

            // get one more day to don't show error if user set 1 more day.
            'to'   => 'bail|required|date|before:+1 days',
        ]);

        if ($v->fails())
            return response()->json([
                'success' => false,
                'errors'  => $v->errors()->all(),
            ]);

        $this->analyze($request->from, $request->to);

        return $this->fetchResult();
    }

    /**
     * Fetch analyzed data to client(Return to client).
     *
     * @return array
     */
    protected function fetchResult()
    {
        return [
            'success'   => true,
            'not-found' => $this->notFoundDates,
            'overall'   => $this->overall->getOverall(),
            'tb'        => $this->countryAnalyzer->getTb(),
        ];
    }

    /**
     * Get json data files and calculate all values:
     *
     * @param $from
     * @param $to
     */
    protected function analyze($from, $to)
    {
        $from = new Carbon($from);
        $to = new Carbon($to);

        $size = $from->diffInDays($to);

        for ($i = 0; $i <= $size; $i++) {
            // Open sniffed file and add to analyzer data:
            $this->proccessData($this->fetchData($from));

            // Going to next day
            $from->addDay(1);
        }
    }

    /**
     * Fetch sniffed data from file, If not exits these file,return empty array.
     *
     * @param $from
     * @return mixed
     */
    protected function fetchData(Carbon $from)
    {
        if (file_exists($this->fname($from))) {
            $string = file_get_contents($this->fname($from));
            return json_decode($string, true);
        } else {
            $this->notFoundDates[] = $from->format('Y-m-d');
            return [];
        }
    }

    protected function fname(Carbon $date)
    {
        $d = $date->format('Y-m-d');
        return $this->conf['res_path'] . '/' . "res-$d.json";

    }

    protected function proccessData(array $data)
    {
        $this->overall->update($data);
        $this->countryAnalyzer->processWholeData($data);
    }
}
