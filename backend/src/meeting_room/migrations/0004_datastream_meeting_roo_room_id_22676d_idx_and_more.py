# Generated by Django 5.2 on 2025-04-13 10:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meeting_room', '0003_alter_datastream_timestamp_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='datastream',
            index=models.Index(fields=['room', 'user'], name='meeting_roo_room_id_22676d_idx'),
        ),
        migrations.AddIndex(
            model_name='datastream',
            index=models.Index(fields=['timestamp'], name='meeting_roo_timesta_96ac54_idx'),
        ),
    ]
