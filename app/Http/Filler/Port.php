<?php
/**
 * Created by PhpStorm.
 * User: mehran
 * Date: 9/8/18
 * Time: 12:36 PM
 */

namespace App\Http\Filler;


class Port extends Filler
{

    /**
     * @param $record
     * @param $values
     * @return mixed
     */
    public function fill(&$record, $values)
    {
        $this->rawFill($record, $values);
    }
}