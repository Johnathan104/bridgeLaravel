<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// NOTE: Laravel naming convention recommends RequestChange (PascalCase), 
// but we maintain your provided requestChange class name.

class requestChange extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'request_changes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'risk_id',
        'change_id',
        'type',
        'status', 
        'requested_by', 
        'description', 
    ];

    // --- Relationships ---

    /**
     * Get the risk item associated with the request change.
     */
    public function risk(): BelongsTo
    {
        // Assuming your Risk model is named 'Risk'
        return $this->belongsTo(Risk::class, 'risk_id');
    }

    /**
     * Get the change item associated with the request change.
     */
    public function change(): BelongsTo
    {
        // Assuming your Change model is named 'Change'
        return $this->belongsTo(Change::class, 'change_id');
    }

    /**
     * Get the user who requested the change.
     */
    public function requester(): BelongsTo
    {
        // Assuming your User model is named 'User'
        return $this->belongsTo(User::class, 'requested_by');
    }
}
