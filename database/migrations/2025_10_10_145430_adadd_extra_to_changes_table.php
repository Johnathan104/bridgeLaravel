<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('changes', function (Blueprint $table) {
            // Add new process-related fields
            $table->text('impact_analysis')->nullable()->after('urn');
            $table->text('mitigation_plan')->nullable()->after('impact_analysis');
            $table->string('approved_by')->nullable()->after('mitigation_plan');
            $table->string('implemented_by')->nullable()->after('approved_by');
            $table->text('evaluation_notes')->nullable()->after('implemented_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('changes', function (Blueprint $table) {
            $table->dropColumn([
                'impact_analysis',
                'mitigation_plan',
                'approved_by',
                'implemented_by',
                'evaluation_notes',
            ]);
        });
    }
};
