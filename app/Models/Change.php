<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Change extends Model
{
    //
    protected $fillable = [
    'date',
    'title',
    'description',
    'pelapor',
    'status',
    'object_id',
    'urn',
    'impact_analysis',     // hasil analisis dampak
    'mitigation_plan',     // rencana mitigasi risiko
    'approved_by',         // siapa yang menyetujui
    'implemented_by',      // siapa pelaksana perubahan
    'evaluation_notes',    // catatan hasil evaluasi
];

}
