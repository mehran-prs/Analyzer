<?php
/**
 * Created by PhpStorm.
 * User: mehran
 * Date: 9/8/18
 * Time: 1:44 PM
 */

namespace App\Http;


use Illuminate\Support\Facades\Log;

class Overall
{
    /**
     * @var array $overall overall data
     */
    protected $overall=[];

    protected $nonNumeric = [];

    public function __construct($nonNumeric)
    {
        $this->nonNumeric = $nonNumeric;
    }

    public function update($data)
    {

        foreach ($data as $ccode => $values) {
            $this->rawUpdate($values);
            $this->rawUpdate($values['ports'], '.ports');
//            $this->rawUpdate($this->overall['ips'], $values['ips'], null);
        }
    }

    /**
     * @param $record
     * @param $values
     * @param string $transPrefix If set to null, we set $key as name .
     */
    protected function rawUpdate($values, $transPrefix = '')
    {
        $this->overall;

        foreach ($values as $key => $val) {
            if (in_array($key, $this->nonNumeric))
                continue;

            if (array_key_exists($key, $this->overall)) {
                $this->overall[$key]['val'] += $val;
            } else {
                $this->overall[$key]['name'] = $transPrefix === null
                    ? $key
                    : trans("sniffer$transPrefix.$key");

                $this->overall[$key]['val'] = $val;
            }
        }
    }

    /**
     * @return array
     */
    public function getOverall(): array
    {
        return $this->overall;
    }
}