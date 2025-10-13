<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'change_id',
        'ratings',
        'comments',
        'evaluated_by',
        'evaluation_date',
        'variansi_rencana',
    ];

    /**
     * The attributes that should be cast to native types.
     * This ensures the date and rating are handled correctly as objects/integers.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'evaluation_date' => 'date',
        'ratings' => 'integer',
    ];

    /**
     * Get the Course that this Evaluation belongs to.
     * Assumes you have a 'Course' model defined in App\Models\Course.
     */
    public function course(): BelongsTo
    {
        // change_id is the foreign key on this model, linking back to the primary key of the Course model.
        return $this->belongsTo(Course::class, 'change_id');
    }
}
