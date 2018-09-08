<?php
/**
 * Created by PhpStorm.
 * User: mehran
 * Date: 9/8/18
 * Time: 12:37 PM
 */

namespace App\Http\Filler;


class IP extends Filler
{

    protected $nonNumeric = ['ports'];
    /**
     * @var Port $portAnalyzer
     */
    protected $portAnalyzer;

    public function __construct()
    {
        $this->portAnalyzer = new Port();
    }

    protected function initRecord()
    {
        return [
            'ports' => [],
        ];
    }

    /**
     * @param $record
     * @param $values
     * @return mixed
     */
    public function fill(&$record, $values)
    {
        $this->rawFill($record, $values);
        $this->portAnalyzer->fill($record['ports'], $values['ports']);
    }

    public function processWholeData(&$ipsContainer, $ips)
    {
        foreach ($ips as $ip => $ipFields) {
            if (!array_key_exists($ip, $ipsContainer))
                $ipsContainer[$ip] = $this->initRecord();

            $this->fill($ipsContainer[$ip], $ipFields);
        }
    }

}