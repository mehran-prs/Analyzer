<?php
/**
 * Created by PhpStorm.
 * User: mehran
 * Date: 9/8/18
 * Time: 12:20 PM
 */

namespace App\Http\Filler;


abstract class Filler
{
    protected $nonNumeric = [];

    /**
     * @param $record
     * @param $values
     */
    protected function rawFill(&$record, $values)
    {
        foreach ($values as $key => $val) {
            if (in_array($key, $this->nonNumeric))
                continue;

            array_key_exists($key, $record)
                ? $record[$key] += $val
                : $record[$key] = $val;
        }
    }


}