<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Risk extends Model
{
    use HasFactory;

    protected $fillable = [
        'risk_code',          // ID Risiko
        'project_name',       // Nama proyek
        'tanggal_kejadian',   // Tanggal kejadian
        'deskripsi_risiko',   // Deskripsi risiko
        'penyebab',           // Penyebab risiko
        'dampak',             // Dampak
        'tindakan_mitigasi',  // Mitigasi
        'status',             // Status
        'urn',                // Masih tetap kalau pakai Forge Viewer
        'object_id',          // Tetap kalau pakai Forge Viewer
    ];
}
